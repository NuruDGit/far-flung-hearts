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
  relationship_status?: string;
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
  const [showAllInterests, setShowAllInterests] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

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
    <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-love-light/10 via-transparent to-love-soft/10 pointer-events-none" />
      
      <CardContent className="relative p-6 sm:p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Enhanced Avatar Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-love-heart to-love-coral rounded-full opacity-75 group-hover:opacity-100 transition-opacity blur-sm" />
            <Avatar 
              className="relative h-24 w-24 sm:h-28 sm:w-28 border-4 border-background cursor-pointer"
              onClick={() => !imageError && profile.avatar_url && setShowImageLightbox(true)}
            >
              <AvatarImage 
                src={!imageError ? profile.avatar_url : undefined} 
                onError={() => setImageError(true)}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-love-light to-love-soft text-love-deep text-2xl font-bold">
                {profile.display_name?.charAt(0).toUpperCase() || '💝'}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && onEdit && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card hover:bg-accent shadow-lg border-2 border-background"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Profile Header */}
          <div className="w-full text-center space-y-3">
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-love-deep to-love-heart bg-clip-text text-transparent">
                {profile.display_name || 'Anonymous'}
              </h3>
              {(formatBirthDate(profile.birth_date) || formatLocation()) && (
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  {formatBirthDate(profile.birth_date) && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-love-light/20">
                      <Calendar className="h-3 w-3 text-love-heart" />
                      <span className="font-medium">{formatBirthDate(profile.birth_date)}</span>
                    </div>
                  )}
                  {formatLocation() && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-love-light/20">
                      <MapPin className="h-3 w-3 text-love-heart" />
                      <span className="font-medium">{formatLocation()}</span>
                      <FlagIcon country={profile.country} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bio Section */}
            {profile.bio && (
              <div className="px-4">
                <p className="text-muted-foreground leading-relaxed text-center max-w-md mx-auto">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Relationship Status */}
            {profile.relationship_status && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-love-light/30 to-love-soft/30 border border-love-soft/50">
                <Heart className="h-4 w-4 text-love-heart" />
                <span className="text-sm font-semibold text-love-deep">
                  {profile.relationship_status}
                </span>
              </div>
            )}

            {/* Interests Section */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Interests
                </h4>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {(showAllInterests ? profile.interests : profile.interests.slice(0, 8)).map((interest, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-xs px-3 py-1 bg-love-light/50 text-love-deep hover:bg-love-soft/70 border border-love-soft/30 transition-all duration-200 hover:scale-105"
                    >
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 8 && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-3 py-1 border-love-heart/50 text-love-heart hover:bg-love-heart hover:text-white cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => setShowAllInterests(!showAllInterests)}
                    >
                      {showAllInterests ? 'Show less' : `+${profile.interests.length - 8} more`}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Join Date */}
            <div className="pt-4 border-t border-love-soft/20">
              <p className="text-xs text-muted-foreground font-medium">
                {formatJoinDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Image Lightbox */}
      {showImageLightbox && profile.avatar_url && !imageError && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] animate-scale-in">
            <img 
              src={profile.avatar_url}
              alt={profile.display_name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full"
              onClick={() => setShowImageLightbox(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};