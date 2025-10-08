import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { DisconnectPairDialog } from '@/components/DisconnectPairDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Users, Download, CreditCard, Trash2, Crown } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  id: string;
  display_name: string;
  bio?: string;
  interests?: string[];
  relationship_status?: string;
  avatar_url?: string;
  created_at?: string;
  birth_date?: string;
  city?: string;
  country?: string;
}

interface PairInfo {
  id: string;
  status: string;
  user_a: string;
  user_b: string;
  created_at: string;
  disconnected_at?: string;
  disconnected_by?: string;
}

export const ProfilePage = () => {
  const { user, loading: authLoading, subscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewingUserId = searchParams.get('userId');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pair, setPair] = useState<PairInfo | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const isViewingPartner = viewingUserId && viewingUserId !== user?.id;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchProfileAndPairData();
  }, [user, authLoading, navigate, viewingUserId]);

  const fetchProfileAndPairData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      
      // Fetch pair information
      const { data: pairData, error: pairError } = await supabase
        .from('pairs')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .maybeSingle();

      if (pairError) {
        console.error('Error fetching pair:', pairError);
      } else if (pairData) {
        setPair(pairData);
        
        // Fetch partner profile (using safe view - excludes email, phone, birth_date)
        const partnerId = pairData.user_a === user.id ? pairData.user_b : pairData.user_a;
        if (partnerId) {
          const { data: partnerData, error: partnerError } = await supabase
            .from('profiles_partner_safe')
            .select('*')
            .eq('id', partnerId)
            .maybeSingle();

          if (partnerError) {
            console.error('Error fetching partner:', partnerError);
          } else {
            setPartner(partnerData);
          }
        }
      }
      
      // If profile is incomplete, show setup
      if (!profileData.display_name || !profileData.bio || !profileData.interests?.length || !profileData.relationship_status || !profileData.birth_date || !profileData.city || !profileData.country) {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setIsEditing(false);
    fetchProfileAndPairData();
  };

  const handleExportData = async () => {
    if (!user) return;
    
    try {
      toast.loading('Preparing your data export...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      // Create blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `love-beyond-borders-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Data export downloaded successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to export data');
    }
  };

  const handleManageSubscription = async () => {
    try {
      toast.loading('Opening subscription portal...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      if (response.data?.url) {
        window.open(response.data.url, '_blank');
        toast.success('Opening Stripe Customer Portal...');
      }
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.error(error.message || 'Failed to open subscription portal');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      toast.loading('Deleting your account...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast.success('Account deleted successfully');
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    return !!(
      profile.display_name &&
      profile.bio &&
      profile.interests?.length &&
      profile.relationship_status &&
      profile.birth_date &&
      profile.city &&
      profile.country
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-love-light to-love-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-love-heart mx-auto mb-4"></div>
          <p className="text-love-deep">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light to-love-soft">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center relative mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="absolute left-0 hover:bg-love-light hover:text-love-deep"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-love-deep">
            {isViewingPartner ? (partner?.display_name || "Partner's Profile") : "Your Profile"}
          </h1>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          {(isViewingPartner ? partner : profile) && (
            <ProfileCard
              profile={isViewingPartner ? partner! : profile!}
              isOwnProfile={!isViewingPartner}
              onEdit={() => setIsEditing(true)}
            />
          )}
        </div>

        {/* Pair Status Section */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>
                Relationship Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pair && partner ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Connected with {partner.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Since {new Date(pair.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <DisconnectPairDialog 
                      pairId={pair.id} 
                      partnerName={partner.display_name}
                    />
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      Disconnecting will end your pair connection and disable couple features. 
                      You can always reconnect later with a new invitation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-muted-foreground mb-2">Not Connected</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You're currently exploring solo. Ready to connect with your partner?
                  </p>
                  <Button 
                    onClick={() => navigate('/pair-setup')}
                    className="bg-love-heart hover:bg-love-coral text-white"
                  >
                    Invite Partner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Actions */}
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
          {!isProfileComplete() && (
            <p className="text-muted-foreground mb-4 text-center">
              Make your profile shine! Complete all sections to help your partner get to know you better.
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-love-heart hover:bg-love-coral text-white"
            >
              Edit Profile
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportData}
              className="border-love-coral text-love-deep hover:bg-love-light"
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Data (GDPR)
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Export includes all your personal data in compliance with GDPR and CCPA regulations
          </p>

          {/* Subscription Management */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>
                Manage your billing and subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 p-4 bg-gradient-to-r from-love-light/30 to-love-soft/30 rounded-lg">
                <div>
                  <p className="font-medium">Current Plan: {subscription.tier === 'premium' ? 'Premium' : 'Free'}</p>
                  {subscription.tier === 'premium' && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Active subscription
                    </p>
                  )}
                </div>
                {subscription.tier === 'free' ? (
                  <Button
                    onClick={() => navigate('/app/subscription')}
                    className="bg-love-heart hover:bg-love-coral text-white w-full sm:w-auto"
                  >
                    Upgrade to Premium
                  </Button>
                ) : (
                  <Button
                    onClick={handleManageSubscription}
                    variant="outline"
                    className="border-love-coral text-love-deep hover:bg-love-light w-full sm:w-auto"
                  >
                    Manage Subscription
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription.tier === 'free' 
                  ? 'Upgrade to Premium for unlimited features and priority support'
                  : 'Manage your subscription, update payment methods, or cancel anytime through the Stripe Customer Portal'}
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions - proceed with caution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                      <p className="font-semibold text-red-600">
                        This includes:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your profile and personal information</li>
                        <li>All messages and shared memories</li>
                        <li>Your pair connection (if any)</li>
                        <li>All subscription data (active subscriptions will be cancelled)</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-xs text-muted-foreground mt-3">
                Deleting your account will automatically cancel any active subscriptions and you will not be charged further.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};