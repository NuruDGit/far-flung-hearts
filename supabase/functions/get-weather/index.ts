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

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!OPENWEATHER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Weather API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch weather data from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${encodeURIComponent(country || '')}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    console.log('Fetching weather for:', city, country);
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      console.error('Weather API error:', await weatherResponse.text());
      return new Response(
        JSON.stringify({ error: 'Weather data not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
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