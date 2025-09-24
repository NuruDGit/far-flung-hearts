import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, MapPin, Heart, Calendar, Crown } from 'lucide-react';

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

interface ProfileCardProps {
  profile: Profile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export const ProfileCard = ({ profile, isOwnProfile = false, onEdit }: ProfileCardProps) => {
  const [imageError, setImageError] = useState(false);

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  const formatLocation = () => {
    if (profile.city && profile.country) {
      return `${profile.city}, ${profile.country}`;
    } else if (profile.city) {
      return profile.city;
    } else if (profile.country) {
      return profile.country;
    }
    return null;
  };

  return (
    <Card className="bg-white/95 backdrop-blur border-love-soft shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-love-light">
              <AvatarImage 
                src={!imageError ? profile.avatar_url : undefined} 
                onError={() => setImageError(true)}
              />
              <AvatarFallback className="bg-love-light text-love-deep text-xl font-semibold">
                {profile.display_name?.charAt(0).toUpperCase() || '💝'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="w-full text-center">
            <div className="flex flex-col items-center justify-center mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-love-deep truncate">
                {profile.display_name || 'Anonymous'}
              </h3>
            </div>

            {/* Join Date */}
            <div className="flex items-center justify-center text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4 mr-1" />
              {formatJoinDate(profile.created_at)}
            </div>

            {/* Birth Date */}
            {formatBirthDate(profile.birth_date) && (
              <div className="flex items-center justify-center text-sm text-muted-foreground mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                {formatBirthDate(profile.birth_date)}
              </div>
            )}

            {/* Location */}
            {formatLocation() && (
              <div className="flex items-center justify-center text-sm text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {formatLocation()}
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed text-center">
                {profile.bio}
              </p>
            )}

            {/* Relationship Goals */}
            {profile.relationship_goals && (
              <div className="flex items-center justify-center mb-4">
                <Crown className="h-4 w-4 mr-2 text-love-heart" />
                <span className="text-sm font-medium text-love-deep text-center">
                  {profile.relationship_goals}
                </span>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground">Interests</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {profile.interests.slice(0, 6).map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-xs bg-love-light text-love-deep hover:bg-love-soft"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 6 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs border-love-soft text-love-deep"
                    >
                      +{profile.interests.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};