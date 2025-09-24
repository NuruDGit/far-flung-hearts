import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProfileSetup } from '@/components/profile/ProfileSetup';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  id: string;
  display_name: string;
  bio?: string;
  interests?: string[];
  relationship_goals?: string;
  avatar_url?: string;
  created_at?: string;
  birth_date?: string;
  city?: string;
  country?: string;
}

export const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchProfile();
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      
      // If profile is incomplete, show setup
      if (!data.display_name || !data.bio || !data.interests?.length || !data.relationship_goals || !data.birth_date || !data.city || !data.country) {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setIsEditing(false);
    fetchProfile();
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mr-0 sm:mr-4 hover:bg-love-light hover:text-love-deep w-max"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to App
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-love-deep text-center">Your Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          {profile && (
            <ProfileCard
              profile={profile}
              isOwnProfile={true}
              onEdit={() => setIsEditing(true)}
            />
          )}
        </div>

        {/* Additional Actions */}
        <div className="max-w-2xl mx-auto mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Make your profile shine! Complete all sections to help your partner get to know you better.
          </p>
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