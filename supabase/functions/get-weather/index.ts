import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')?.trim();
    
    if (!OPENWEATHER_API_KEY) {
      // Return 200 with an error payload to avoid client exceptions
      return new Response(
        JSON.stringify({ error: 'missing_api_key', message: 'Weather API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resolve city to coordinates using OpenWeather Geocoding API
    const primaryQuery = country ? `${city},${country}` : city;
    const geoUrlPrimary = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(primaryQuery)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
    const geoRespPrimary = await fetch(geoUrlPrimary);
    let geoResults: any[] = geoRespPrimary.ok ? await geoRespPrimary.json() : [];

    // Fallback: try with city only if nothing found
    if (!Array.isArray(geoResults) || geoResults.length === 0) {
      const geoUrlFallback = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      const geoRespFallback = await fetch(geoUrlFallback);
      geoResults = geoRespFallback.ok ? await geoRespFallback.json() : [];
    }

    if (!Array.isArray(geoResults) || geoResults.length === 0) {
      return new Response(
        JSON.stringify({ error: 'location_not_found', message: 'Could not locate the specified city' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { lat, lon, name, country: countryCode } = geoResults[0];

    // Fetch weather data by coordinates
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log('Fetching weather for:', name || city, countryCode || country);
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      console.error('Weather API error:', await weatherResponse.text());
      return new Response(
        JSON.stringify({ error: 'weather_not_found', message: 'Weather data not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherData = await weatherResponse.json();

    // Fetch city image from Unsplash
    let cityImage = '';
    try {
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city + ' city skyline')}&per_page=1&client_id=B5mnEcLIH-bQYvIXLaZ5n8X-JYdQMwNe4rMN7oXbKrk`;
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

    // Format weather data
    const formattedWeather = {
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind?.speed || 0,
      city: weatherData.name,
      country: weatherData.sys.country
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