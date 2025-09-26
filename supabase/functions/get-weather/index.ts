import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// City coordinates mapping for reliable weather data
const CITY_COORDINATES: Record<string, { lat: number; lon: number; displayName: string; country: string }> = {
  'dubai': { lat: 25.0657, lon: 55.1713, displayName: 'Dubai', country: 'United Arab Emirates' },
  'new york': { lat: 40.7128, lon: -74.0060, displayName: 'New York', country: 'United States' },
  'london': { lat: 51.5074, lon: -0.1278, displayName: 'London', country: 'United Kingdom' },
  'paris': { lat: 48.8566, lon: 2.3522, displayName: 'Paris', country: 'France' },
  'tokyo': { lat: 35.6762, lon: 139.6503, displayName: 'Tokyo', country: 'Japan' },
  'sydney': { lat: -33.8688, lon: 151.2093, displayName: 'Sydney', country: 'Australia' },
  'mumbai': { lat: 19.0760, lon: 72.8777, displayName: 'Mumbai', country: 'India' },
  'singapore': { lat: 1.3521, lon: 103.8198, displayName: 'Singapore', country: 'Singapore' },
  'toronto': { lat: 43.6532, lon: -79.3832, displayName: 'Toronto', country: 'Canada' },
  'berlin': { lat: 52.5200, lon: 13.4050, displayName: 'Berlin', country: 'Germany' },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, country } = await req.json();

    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Normalize city name for lookup
    const normalizedCity = city.toLowerCase().trim();
    const cityData = CITY_COORDINATES[normalizedCity];

    if (!cityData) {
      return new Response(
        JSON.stringify({ error: 'city_not_supported', message: `Weather data not available for ${city}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lon, displayName, country: cityCountry } = cityData;

    // Fetch weather data from Open-Meteo (free, no API key required)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
    console.log('Fetching weather for:', displayName, cityCountry);
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      console.error('Weather API error:', await weatherResponse.text());
      return new Response(
        JSON.stringify({ error: 'weather_api_error', message: 'Failed to fetch weather data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherData = await weatherResponse.json();

    // Helper function to get weather description from code
    const getWeatherDescription = (code: number): string => {
      if (code === 0) return 'Clear sky';
      if (code <= 3) return 'Partly cloudy';
      if (code <= 48) return 'Foggy';
      if (code <= 67) return 'Rainy';
      if (code <= 77) return 'Snowy';
      if (code <= 82) return 'Rain showers';
      if (code <= 86) return 'Snow showers';
      if (code <= 99) return 'Thunderstorm';
      return 'Unknown';
    };

    // Fetch city image from Unsplash
    let cityImage = '';
    try {
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(displayName + ' city skyline')}&per_page=1&client_id=B5mnEcLIH-bQYvIXLaZ5n8X-JYdQMwNe4rMN7oXbKrk`;
      const imageResponse = await fetch(unsplashUrl);
      
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        if (imageData.results && imageData.results.length > 0) {
          cityImage = imageData.results[0].urls.regular;
        }
      }
    } catch (imageError) {
      console.warn('Failed to fetch city image:', imageError);
      // Continue without image - it's not critical
    }

    // Format weather data from Open-Meteo response
    const current = weatherData.current;
    const formattedWeather = {
      temperature: Math.round(current.temperature_2m),
      description: getWeatherDescription(current.weather_code),
      icon: current.weather_code <= 3 ? '01d' : (current.weather_code <= 67 ? '09d' : '11d'), // Simple icon mapping
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10, // Round to 1 decimal
      city: displayName,
      country: cityCountry
    };

    console.log('Successfully fetched weather for:', formattedWeather.city);

    return new Response(
      JSON.stringify({ 
        weather: formattedWeather,
        cityImage: cityImage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});