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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Camera, X, MapPin, Calendar as CalendarIcon, ArrowLeft, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const INTERESTS = [
  'Hiking', 'Reading', 'Cooking', 'Travel', 'Music', 'Art', 'Movies', 'Gaming',
  'Photography', 'Dancing', 'Sports', 'Yoga', 'Gardening', 'Writing', 'Technology',
  'Fashion', 'Food', 'Nature', 'Animals', 'Fitness'
];

const RELATIONSHIP_STATUS = [
  'In a Relationship',
  'Living Together',
  'Engaged',
  'Married',
  'Civil Partnership',
  'Common Law Partners'
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
  relationship_start_date?: Date;
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
    country: '',
    relationship_start_date: undefined
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
          country: profile.country || null,
          relationship_start_date: profile.relationship_start_date?.toISOString().split('T')[0] || null
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
    <div className="min-h-screen bg-gradient-to-br from-background via-love-light/20 to-love-soft/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-love-heart/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-love-coral/5 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-3xl bg-card/95 backdrop-blur-sm shadow-2xl border-0 relative z-10">
        <CardHeader className="relative pb-8">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/app')}
              className="hover:bg-black/10 text-black hover:text-black p-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-center space-y-4 pt-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-love-deep to-love-heart bg-clip-text text-transparent mx-auto">
              Complete Your Profile
            </CardTitle>
            <p className="text-muted-foreground text-lg mx-auto max-w-md">
              Let's personalize your love journey together
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload - More prominent and beautiful */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-love-heart to-love-coral rounded-full opacity-75 group-hover:opacity-100 transition-opacity blur-sm"></div>
                <Avatar className="relative h-32 w-32 border-4 border-background">
                  <AvatarImage src={profile.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-love-light to-love-soft text-love-deep text-3xl">
                    {profile.display_name.charAt(0).toUpperCase() || '👤'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-love-heart hover:bg-love-coral shadow-lg border-2 border-background"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Upload your photo
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the camera icon to add your picture
                </p>
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-love-heart rounded-full"></div>
                  Basic Information
                </h3>
                
                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-sm font-medium text-foreground">
                    Display Name *
                  </Label>
                  <Input
                    id="display_name"
                    value={profile.display_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="What should we call you?"
                    className="h-12 focus:border-love-heart focus:ring-love-heart/20 border-2"
                  />
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="text-sm font-medium text-foreground flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Birth Date
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={profile.birth_date}
                    onChange={(e) => setProfile(prev => ({ ...prev, birth_date: e.target.value }))}
                    className="h-12 focus:border-love-heart focus:ring-love-heart/20 border-2"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-foreground flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      City
                    </Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Your city"
                      className="h-12 focus:border-love-heart focus:ring-love-heart/20 border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium text-foreground">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={profile.country}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="Your country"
                      className="h-12 focus:border-love-heart focus:ring-love-heart/20 border-2"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                    About You
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us a bit about yourself, your hobbies, what makes you unique..."
                    rows={4}
                    className="focus:border-love-heart focus:ring-love-heart/20 border-2 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-love-heart rounded-full"></div>
                  Your Interests
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select what you're passionate about (choose as many as you like)
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={profile.interests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 px-4 py-2 text-sm ${
                      profile.interests.includes(interest)
                        ? 'bg-love-heart hover:bg-love-coral text-white shadow-md'
                        : 'hover:bg-love-light/50 hover:border-love-heart border-2'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                    {profile.interests.includes(interest) && (
                      <X className="ml-2 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Relationship Status */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-love-heart rounded-full"></div>
                  Relationship Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  What type of relationship are you in? This helps us provide better AI recommendations.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RELATIONSHIP_STATUS.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={profile.relationship_status === status ? "default" : "outline"}
                    className={`justify-start text-left h-auto py-4 px-4 whitespace-normal border-2 transition-all duration-200 ${
                      profile.relationship_status === status
                        ? 'bg-love-heart hover:bg-love-coral text-white shadow-md'
                        : 'hover:bg-love-light/50 hover:border-love-heart hover:text-love-deep'
                    }`}
                    onClick={() => setProfile(prev => ({ ...prev, relationship_status: status }))}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Relationship Start Date */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-love-heart rounded-full"></div>
                  When did your relationship begin?
                </h3>
                <p className="text-sm text-muted-foreground">
                  This helps us provide milestone reminders and personalized advice based on your relationship journey.
                </p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 border-2 focus:border-love-heart focus:ring-love-heart/20",
                      !profile.relationship_start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {profile.relationship_start_date ? (
                      format(profile.relationship_start_date, "PPP")
                    ) : (
                      <span>Pick your special date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={profile.relationship_start_date}
                    onSelect={(date) => setProfile(prev => ({ ...prev, relationship_start_date: date }))}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              disabled={loading || !profile.display_name.trim()}
              className="w-full h-12 bg-gradient-to-r from-love-heart to-love-coral hover:from-love-coral hover:to-love-heart text-white font-semibold shadow-lg transition-all duration-200"
            >
              {loading ? 'Saving...' : 'Complete Profile ✨'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};