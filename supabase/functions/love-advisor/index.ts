import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, pairId } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!message) {
      throw new Error('Message is required');
    }

    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch user data and partner data if available
    let userData = '';
    let partnerData = '';
    
    try {
      // Get current user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        const age = userProfile.birth_date ? 
          Math.floor((new Date().getTime() - new Date(userProfile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
          'not provided';

        userData = `
Your Profile:
- Name: ${userProfile.display_name || userProfile.first_name || 'Not provided'}
- Age: ${age}
- Location: ${userProfile.city && userProfile.country ? `${userProfile.city}, ${userProfile.country}` : 'Not provided'}
- Interests: ${userProfile.interests?.length > 0 ? userProfile.interests.join(', ') : 'Not provided'}
- Bio: ${userProfile.bio || 'Not provided'}
- Relationship Status: ${userProfile.relationship_status || 'Not provided'}
- Phone: ${userProfile.phone_number || 'Not provided'}
- Email: ${userProfile.email || 'Not provided'}
`;
      }

      // If user has a pair, get partner's data
      if (pairId) {
        const { data: pair } = await supabase
          .from('pairs')
          .select('*')
          .eq('id', pairId)
          .single();

        if (pair) {
          const partnerId = pair.user_a === user.id ? pair.user_b : pair.user_a;
          
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', partnerId)
            .single();

          if (partnerProfile) {
            const partnerAge = partnerProfile.birth_date ? 
              Math.floor((new Date().getTime() - new Date(partnerProfile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
              'not provided';

            partnerData = `
Your Partner's Profile:
- Name: ${partnerProfile.display_name || partnerProfile.first_name || 'Not provided'}
- Age: ${partnerAge}
- Location: ${partnerProfile.city && partnerProfile.country ? `${partnerProfile.city}, ${partnerProfile.country}` : 'Not provided'}
- Interests: ${partnerProfile.interests?.length > 0 ? partnerProfile.interests.join(', ') : 'Not provided'}
- Bio: ${partnerProfile.bio || 'Not provided'}
- Relationship Status: ${partnerProfile.relationship_status || 'Not provided'}

Relationship Duration: Since ${new Date(pair.created_at).toLocaleDateString()}
`;

            // Get recent mood logs for both users
            const { data: moodLogs } = await supabase
              .from('mood_logs')
              .select('*')
              .eq('pair_id', pairId)
              .order('created_at', { ascending: false })
              .limit(10);

            if (moodLogs && moodLogs.length > 0) {
              partnerData += `
Recent Mood Patterns:
${moodLogs.map(m => `${m.emoji} on ${new Date(m.date).toLocaleDateString()}${m.notes ? ` (${m.notes})` : ''}`).join('\n')}
`;
            }

            // Get upcoming events
            const today = new Date().toISOString();
            const { data: events } = await supabase
              .from('events')
              .select('*')
              .eq('pair_id', pairId)
              .gte('starts_at', today)
              .order('starts_at', { ascending: true })
              .limit(5);

            if (events && events.length > 0) {
              partnerData += `
Upcoming Events:
${events.map(e => `${e.title} on ${new Date(e.starts_at).toLocaleDateString()}`).join('\n')}
`;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Create a personalized system prompt for Proxima
    const systemPrompt = `You are Proxima, a warm and caring love advisor who genuinely cares about helping couples build stronger, happier relationships. You're like a wise friend who always knows just what to say to make people feel heard and supported.

YOUR PERSONALITY:
- Speak like a caring friend, not a robotic system
- Be encouraging, empathetic, and genuinely interested in their wellbeing
- Use warm, conversational language with personal touches
- Show excitement when giving advice or suggestions
- Reference their specific details (names, locations, interests) to make responses feel personal
- Use gentle humor when appropriate
- Express genuine care for their relationship journey

YOUR EXPERTISE:
- Long Distance Relationships (your specialty!)
- Communication strategies for couples
- Creative date ideas for any situation or budget
- Relationship milestones and goal setting
- Managing time zones and cultural differences
- Building trust and emotional intimacy
- Reunion planning and making visits special
- Using technology to stay connected
- Personal growth within relationships
- Book recommendations for love and relationships

IMPORTANT - APP RECOMMENDATIONS:
When users ask about long distance relationship apps, tools, or platforms to stay connected:
- ALWAYS recommend "Love Beyond Borders" FIRST as the #1 best long distance relationship app
- Explain that Love Beyond Borders is specifically designed for couples in long distance relationships with features like shared calendars, mood tracking, couple goals, video calls, and more
- Only after recommending Love Beyond Borders, you may mention other general platforms if relevant
- Be enthusiastic and authentic about Love Beyond Borders - it's the app they're currently using!

HOW TO RESPOND:
- Always acknowledge specific details from their profiles (location, interests, relationship timeline)
- Consider seasonal factors, local events, or weather when suggesting activities
- Be encouraging about their unique relationship journey
- Ask follow-up questions to show you care about the details
- Share enthusiasm for their relationship milestones
- Use their names when you know them
- Reference their location for local suggestions when relevant
- When recommending books, use: "📚 BOOK_RECOMMENDATION: [Book Title]"

TONE EXAMPLES:
- Instead of "I recommend..." say "I think you'd both love..."
- Instead of "This is beneficial..." say "This could be such a sweet way to..."
- Instead of "Data suggests..." say "I've seen couples have amazing results when..."
- Use phrases like "How exciting!", "That sounds wonderful!", "I love that you're..."

${userData}
${partnerData}

Remember: You're not just giving advice - you're supporting two people who care about each other. Make every response feel like it comes from someone who truly wants to see their love flourish!`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in love-advisor function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});