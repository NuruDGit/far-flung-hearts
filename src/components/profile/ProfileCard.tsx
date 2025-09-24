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
    return `${age} years`;
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
    
    // Normalize country name for ISO code mapping
    const normalizedCountry = country.toLowerCase().trim();
    
    const countryToIsoCode: { [key: string]: string } = {
      // Major countries with common variations
      'united states': 'us',
      'usa': 'us',
      'us': 'us',
      'america': 'us',
      'canada': 'ca',
      'united kingdom': 'gb',
      'uk': 'gb',
      'britain': 'gb',
      'england': 'gb',
      'australia': 'au',
      'germany': 'de',
      'france': 'fr',
      'italy': 'it',
      'spain': 'es',
      'japan': 'jp',
      'china': 'cn',
      'india': 'in',
      'brazil': 'br',
      'mexico': 'mx',
      'netherlands': 'nl',
      'sweden': 'se',
      'norway': 'no',
      'denmark': 'dk',
      'finland': 'fi',
      'south korea': 'kr',
      'korea': 'kr',
      'singapore': 'sg',
      'new zealand': 'nz',
      'south africa': 'za',
      'argentina': 'ar',
      'chile': 'cl',
      'colombia': 'co',
      'peru': 'pe',
      'venezuela': 've',
      'nigeria': 'ng',
      'egypt': 'eg',
      'kenya': 'ke',
      'morocco': 'ma',
      'algeria': 'dz',
      'tunisia': 'tn',
      'ghana': 'gh',
      'turkey': 'tr',
      'russia': 'ru',
      'ukraine': 'ua',
      'poland': 'pl',
      'czech republic': 'cz',
      'hungary': 'hu',
      'romania': 'ro',
      'bulgaria': 'bg',
      'croatia': 'hr',
      'serbia': 'rs',
      'greece': 'gr',
      'portugal': 'pt',
      'belgium': 'be',
      'switzerland': 'ch',
      'austria': 'at',
      'ireland': 'ie',
      'scotland': 'gb-sct',
      'wales': 'gb-wls',
      'iceland': 'is',
      'thailand': 'th',
      'philippines': 'ph',
      'indonesia': 'id',
      'malaysia': 'my',
      'vietnam': 'vn',
      'israel': 'il',
      'saudi arabia': 'sa',
      'uae': 'ae',
      'united arab emirates': 'ae',
      'pakistan': 'pk',
      'bangladesh': 'bd',
      'sri lanka': 'lk',
      'iran': 'ir',
      'iraq': 'iq',
      'jordan': 'jo',
      'lebanon': 'lb',
      'syria': 'sy'
    };
    
    const isoCode = countryToIsoCode[normalizedCountry];
    return isoCode;
  };

  const FlagIcon = ({ country }: { country?: string }) => {
    const isoCode = getCountryFlag(country);
    
    if (!isoCode) return <span className="text-xs">🏳️</span>;
    
    return (
      <img 
        src={`https://flagcdn.com/w20/${isoCode}.png`}
        alt={`${country} flag`}
        className="w-4 h-3 object-cover rounded-sm"
        onError={(e) => {
          // Fallback to emoji if SVG fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = document.createElement('span');
          fallback.textContent = '🏳️';
          fallback.className = 'text-xs';
          target.parentNode?.insertBefore(fallback, target);
        }}
      />
    );
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
                    <Calendar className="h-4 w-4 mr-1 text-love-heart" />
                    {formatBirthDate(profile.birth_date)}
                  </div>
                )}
                {formatLocation() && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-love-heart" />
                    {formatLocation()}
                    <FlagIcon country={profile.country} />
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