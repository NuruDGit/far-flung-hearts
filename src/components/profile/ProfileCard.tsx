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
      return profile.city;
    } else if (profile.city) {
      return profile.city;
    }
    return null;
  };

  const getCountryFlag = (country?: string) => {
    if (!country) return null;
    
    // Normalize country name for better matching
    const normalizedCountry = country.toLowerCase().trim();
    
    const countryFlags: { [key: string]: string } = {
      // Major countries with common variations
      'united states': '🇺🇸',
      'usa': '🇺🇸',
      'us': '🇺🇸',
      'america': '🇺🇸',
      'canada': '🇨🇦',
      'united kingdom': '🇬🇧',
      'uk': '🇬🇧',
      'britain': '🇬🇧',
      'england': '🇬🇧',
      'australia': '🇦🇺',
      'germany': '🇩🇪',
      'france': '🇫🇷',
      'italy': '🇮🇹',
      'spain': '🇪🇸',
      'japan': '🇯🇵',
      'china': '🇨🇳',
      'india': '🇮🇳',
      'brazil': '🇧🇷',
      'mexico': '🇲🇽',
      'netherlands': '🇳🇱',
      'sweden': '🇸🇪',
      'norway': '🇳🇴',
      'denmark': '🇩🇰',
      'finland': '🇫🇮',
      'south korea': '🇰🇷',
      'korea': '🇰🇷',
      'singapore': '🇸🇬',
      'new zealand': '🇳🇿',
      'south africa': '🇿🇦',
      'argentina': '🇦🇷',
      'chile': '🇨🇱',
      'colombia': '🇨🇴',
      'peru': '🇵🇪',
      'venezuela': '🇻🇪',
      'nigeria': '🇳🇬',
      'egypt': '🇪🇬',
      'kenya': '🇰🇪',
      'morocco': '🇲🇦',
      'algeria': '🇩🇿',
      'tunisia': '🇹🇳',
      'ghana': '🇬🇭',
      'turkey': '🇹🇷',
      'russia': '🇷🇺',
      'ukraine': '🇺🇦',
      'poland': '🇵🇱',
      'czech republic': '🇨🇿',
      'hungary': '🇭🇺',
      'romania': '🇷🇴',
      'bulgaria': '🇧🇬',
      'croatia': '🇭🇷',
      'serbia': '🇷🇸',
      'greece': '🇬🇷',
      'portugal': '🇵🇹',
      'belgium': '🇧🇪',
      'switzerland': '🇨🇭',
      'austria': '🇦🇹',
      'ireland': '🇮🇪',
      'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
      'iceland': '🇮🇸',
      'thailand': '🇹🇭',
      'philippines': '🇵🇭',
      'indonesia': '🇮🇩',
      'malaysia': '🇲🇾',
      'vietnam': '🇻🇳',
      'israel': '🇮🇱',
      'saudi arabia': '🇸🇦',
      'uae': '🇦🇪',
      'united arab emirates': '🇦🇪',
      'pakistan': '🇵🇰',
      'bangladesh': '🇧🇩',
      'sri lanka': '🇱🇰',
      'iran': '🇮🇷',
      'iraq': '🇮🇶',
      'jordan': '🇯🇴',
      'lebanon': '🇱🇧',
      'syria': '🇸🇾'
    };
    
    const flag = countryFlags[normalizedCountry];
    return flag || `🏳️`;
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


            {/* Age and Location */}
            {(formatBirthDate(profile.birth_date) || formatLocation()) && (
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-3">
                {formatBirthDate(profile.birth_date) && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatBirthDate(profile.birth_date)}
                  </div>
                )}
                {formatLocation() && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formatLocation()}
                    {getCountryFlag(profile.country) && (
                      <span className="ml-1">{getCountryFlag(profile.country)}</span>
                    )}
                  </div>
                )}
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
              <div className="mb-4">
                <p className="text-sm font-bold text-muted-foreground text-center mb-2">Relationship Goal</p>
                <div className="flex items-center justify-center">
                  <Crown className="h-4 w-4 mr-2 text-love-heart" />
                  <span className="text-sm font-medium text-love-deep text-center">
                    {profile.relationship_goals}
                  </span>
                </div>
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