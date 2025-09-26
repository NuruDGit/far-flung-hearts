import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  country: string;
}

interface WeatherWidgetProps {
  partnerCity?: string;
  partnerCountry?: string;
}

const WeatherWidget = ({ partnerCity, partnerCountry }: WeatherWidgetProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [cityImage, setCityImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (partnerCity && partnerCountry) {
      fetchWeatherData();
    }
  }, [partnerCity, partnerCountry]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError('');

      // Call edge function to get weather data
      const { data, error: weatherError } = await supabase.functions.invoke('get-weather', {
        body: { 
          city: partnerCity,
          country: partnerCountry 
        }
      });

      if (weatherError) {
        throw new Error(weatherError.message);
      }

      if (data.weather) {
        setWeather(data.weather);
      }
      
      if (data.cityImage) {
        setCityImage(data.cityImage);
      }

    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Unable to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeather icons to Lucide icons
    if (iconCode.includes('01')) return <Sun className="w-6 h-6 text-yellow-500" />;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="w-6 h-6 text-gray-500" />;
    if (iconCode.includes('09') || iconCode.includes('10') || iconCode.includes('11')) return <CloudRain className="w-6 h-6 text-blue-500" />;
    if (iconCode.includes('13')) return <CloudSnow className="w-6 h-6 text-blue-200" />;
    return <Cloud className="w-6 h-6 text-gray-500" />;
  };

  if (!partnerCity || !partnerCountry) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-6 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gradient-to-r from-love-coral/20 to-love-heart/20 rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-love-coral/20 rounded w-3/4"></div>
              <div className="h-3 bg-love-coral/20 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="mb-6 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Weather unavailable for {partnerCity}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* City Image Header */}
        <div className="relative h-32 bg-gradient-to-r from-love-coral/30 to-love-heart/30">
          {cityImage && (
            <img 
              src={cityImage} 
              alt={`${partnerCity} cityscape`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-3 left-4 text-white">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{weather.city}, {weather.country}</span>
            </div>
          </div>
        </div>

        {/* Weather Info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeatherIcon(weather.icon)}
              <div>
                <div className="text-2xl font-bold text-love-deep">
                  {Math.round(weather.temperature)}°C
                </div>
                <div className="text-sm text-muted-foreground capitalize">
                  {weather.description}
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Wind className="w-3 h-3" />
                <span>{weather.windSpeed} m/s</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Thermometer className="w-3 h-3" />
                <span>{weather.humidity}% humidity</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;