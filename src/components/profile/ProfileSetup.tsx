import { useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, X, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const INTERESTS = [
  'Hiking', 'Reading', 'Cooking', 'Travel', 'Music', 'Art', 'Movies', 'Gaming',
  'Photography', 'Dancing', 'Sports', 'Yoga', 'Gardening', 'Writing', 'Technology',
  'Fashion', 'Food', 'Nature', 'Animals', 'Fitness'
];

const RELATIONSHIP_STATUS = [
  'Dating',
  'In a Relationship',
  'Engaged',
  'Married',
  'Long Distance',
  'It\'s Complicated'
];

interface Profile {
  display_name: string;
  bio: string;
  interests: string[];
  relationship_status: string;
  avatar_url?: string;
  birth_date?: string;
  city?: string;
  country?: string;
}

export const ProfileSetup = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    display_name: '',
    bio: '',
    interests: [],
    relationship_status: '',
    avatar_url: '',
    birth_date: '',
    city: '',
    country: ''
  });

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!profile.display_name.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          interests: profile.interests,
          relationship_status: profile.relationship_status,
          avatar_url: profile.avatar_url,
          birth_date: profile.birth_date || null,
          city: profile.city || null,
          country: profile.country || null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-love-light to-love-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur shadow-xl">
        <CardHeader className="relative">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="hover:bg-love-light hover:text-love-deep p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl sm:text-2xl font-bold text-love-deep">
              Complete Your Profile
            </CardTitle>
          </div>
          <p className="text-muted-foreground">
            Let's personalize your experience and help you find meaningful connections
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="bg-love-light text-love-deep text-2xl">
                    {profile.display_name.charAt(0).toUpperCase() || '👤'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-love-heart hover:bg-love-coral"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Click the camera icon to upload your photo
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-love-deep">
                Display Name *
              </Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="What should we call you?"
                className="focus:border-love-heart focus:ring-love-heart"
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Label htmlFor="birth_date" className="text-love-deep flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Birth Date
              </Label>
              <Input
                id="birth_date"
                type="date"
                value={profile.birth_date}
                onChange={(e) => setProfile(prev => ({ ...prev, birth_date: e.target.value }))}
                className="focus:border-love-heart focus:ring-love-heart"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-love-deep flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  City
                </Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Your city"
                  className="focus:border-love-heart focus:ring-love-heart"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-love-deep">
                  Country
                </Label>
                <Input
                  id="country"
                  value={profile.country}
                  onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Your country"
                  className="focus:border-love-heart focus:ring-love-heart"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-love-deep">
                About You
              </Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us a bit about yourself, your hobbies, what makes you unique..."
                rows={3}
                className="focus:border-love-heart focus:ring-love-heart"
              />
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label className="text-love-deep">
                Your Interests
              </Label>
              <p className="text-sm text-muted-foreground">
                Select what you're passionate about (choose as many as you like)
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={profile.interests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      profile.interests.includes(interest)
                        ? 'bg-love-heart hover:bg-love-coral text-white'
                        : 'hover:bg-love-light hover:border-love-heart'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                    {profile.interests.includes(interest) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Relationship Status */}
            <div className="space-y-3">
              <Label className="text-love-deep">
                Relationship Status
              </Label>
              <p className="text-sm text-muted-foreground">
                What type of relationship are you in? This helps us provide better AI recommendations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RELATIONSHIP_STATUS.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={profile.relationship_status === status ? "default" : "outline"}
                    className={`justify-start text-left h-auto py-3 px-4 whitespace-normal ${
                      profile.relationship_status === status
                        ? 'bg-love-heart hover:bg-love-coral text-white'
                        : 'hover:bg-love-light hover:border-love-heart hover:text-love-deep'
                    }`}
                    onClick={() => setProfile(prev => ({ ...prev, relationship_status: status }))}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !profile.display_name.trim()}
              className="w-full bg-love-heart hover:bg-love-coral text-white"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};