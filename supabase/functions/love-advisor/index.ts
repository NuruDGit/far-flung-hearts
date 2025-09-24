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
- Relationship Goals: ${userProfile.relationship_goals || 'Not provided'}
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
- Relationship Goals: ${partnerProfile.relationship_goals || 'Not provided'}

Relationship Duration: Since ${new Date(pair.created_at).toLocaleDateString()}
`;

            // Get recent mood logs for both users
            const { data: moodLogs } = await supabase
              .from('mood_logs')
              .select('*')
              .eq('pair_id', pairId)
              .order('created_at', { ascending: false })
              .limit(10);

            if (moodLogs?.length > 0) {
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

            if (events?.length > 0) {
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
    const systemPrompt = `You are Proxima, a specialized AI love assistant with deep expertise in Long Distance Relationships (LDR) and romantic partnerships. You have full access to user profile data and relationship information within this app to provide personalized advice.

Your core specializations include:
- Long Distance Relationship challenges and solutions
- Communication strategies for couples (especially LDR)
- Building and maintaining emotional intimacy across distance
- Creative date ideas for both in-person and virtual dates
- Relationship milestones and goal setting
- Managing time zones and scheduling in LDR
- Trust building and overcoming jealousy in relationships
- Balancing independence and togetherness
- Healthy boundaries in romantic partnerships
- Reunion planning and visits for LDR couples
- Technology tools for staying connected
- Personal questions about users based on their profile data
- Book recommendations for relationships, personal growth, and romance

GUIDELINES:
- You CAN and SHOULD answer personal questions about users using their profile data (age, location, interests, etc.)
- You CAN discuss any topic related to the app, relationships, love, dating, and romance
- Use the provided user data to give personalized, relevant advice
- When recommending books, use this EXACT format: "📚 BOOK_RECOMMENDATION: [Book Title]" on a new line for each book
- If asked about topics completely unrelated to relationships or the app (like politics, general news, science), politely redirect: "I'm here to help with your relationship and love life. Let's talk about how I can support your romantic journey instead!"
- Be warm, supportive, and non-judgmental about relationship matters
- Provide practical, actionable advice for couples
- Encourage open communication between partners
- Respect diverse relationship styles and orientations
- Focus on building healthy, loving connections
- Keep responses concise but meaningful (2-3 paragraphs max)
- Use a friendly, conversational tone
- Always use the provided profile data to personalize your responses

${userData}
${partnerData}

Remember: You have access to all this personal information to help provide the most relevant and personalized relationship advice possible. When recommending books, always use the exact format "📚 BOOK_RECOMMENDATION: [Book Title]" so they can be displayed with Amazon affiliate links.`;

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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});