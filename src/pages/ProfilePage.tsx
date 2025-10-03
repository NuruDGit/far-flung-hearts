import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { DisconnectPairDialog } from '@/components/DisconnectPairDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Heart, User } from 'lucide-react';
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
  const { user, loading: authLoading } = useAuth();
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
        
        // Fetch partner profile
        const partnerId = pairData.user_a === user.id ? pairData.user_b : pairData.user_a;
        if (partnerId) {
          const { data: partnerData, error: partnerError } = await supabase
            .from('profiles')
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
        <div className="max-w-2xl mx-auto mt-8 text-center">
          {!isProfileComplete() && (
            <p className="text-muted-foreground mb-4">
              Make your profile shine! Complete all sections to help your partner get to know you better.
            </p>
          )}
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-love-heart hover:bg-love-coral text-white"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};