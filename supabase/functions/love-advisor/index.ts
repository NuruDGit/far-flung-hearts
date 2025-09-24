import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch partner data if pairId is provided
    let partnerContext = '';
    if (pairId) {
      try {
        // Get both partners' profiles
        const { data: profiles } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/profiles?select=*&pair_id=eq.${pairId}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          }
        }).then(res => res.json());

        // Get recent mood logs
        const { data: moodLogs } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/mood_logs?select=*&pair_id=eq.${pairId}&order=created_at.desc&limit=10`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          }
        }).then(res => res.json());

        // Get upcoming events
        const today = new Date().toISOString();
        const { data: events } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/events?select=*&pair_id=eq.${pairId}&starts_at=gte.${today}&order=starts_at.asc&limit=5`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          }
        }).then(res => res.json());

        // Get pair information
        const { data: pairInfo } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/pairs?select=*&id=eq.${pairId}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          }
        }).then(res => res.json());

        if (profiles?.length > 0) {
          const partnerData = profiles.map(p => ({
            name: p.display_name || p.first_name,
            interests: p.interests || [],
            birthDate: p.birth_date,
            bio: p.bio,
            relationshipGoals: p.relationship_goals,
            city: p.city,
            country: p.country
          }));

          partnerContext = `
Partner Information:
${partnerData.map(p => `
- Name: ${p.name || 'Not provided'}
- Interests: ${p.interests.length > 0 ? p.interests.join(', ') : 'Not provided'}
- Birth Date: ${p.birthDate || 'Not provided'}
- Bio: ${p.bio || 'Not provided'}
- Relationship Goals: ${p.relationshipGoals || 'Not provided'}
- Location: ${p.city && p.country ? `${p.city}, ${p.country}` : 'Not provided'}
`).join('\n')}

Recent Mood Patterns:
${moodLogs?.length > 0 ? moodLogs.map(m => `${m.emoji} on ${new Date(m.date).toLocaleDateString()}${m.notes ? ` (${m.notes})` : ''}`).join('\n') : 'No recent mood logs'}

Upcoming Events:
${events?.length > 0 ? events.map(e => `${e.title} on ${new Date(e.starts_at).toLocaleDateString()}`).join('\n') : 'No upcoming events'}

Relationship Duration: ${pairInfo?.[0]?.created_at ? `Since ${new Date(pairInfo[0].created_at).toLocaleDateString()}` : 'Not available'}
`;
        }
      } catch (error) {
        console.error('Error fetching partner data:', error);
        partnerContext = 'Partner data temporarily unavailable.';
      }
    }

    // Create a personalized system prompt for Proxima
    const systemPrompt = `You are Proxima, a wise and empathetic AI love assistant. You specialize in providing thoughtful, supportive guidance for couples and individuals in relationships.

Your expertise includes:
- Communication strategies and conflict resolution
- Building emotional intimacy and connection
- Date ideas and romantic gestures
- Relationship milestones and goal setting
- Managing long-distance relationships
- Balancing independence and togetherness
- Trust building and maintaining healthy boundaries

Guidelines:
- Be warm, supportive, and non-judgmental
- Provide practical, actionable advice
- Encourage open communication between partners
- Respect diverse relationship styles and orientations
- Focus on building healthy, loving connections
- Keep responses concise but meaningful (2-3 paragraphs max)
- Use a friendly, conversational tone
- When you have partner data, use it to make personalized recommendations

${partnerContext ? `Current Relationship Context: ${partnerContext}` : 'User seeking general relationship advice.'}`;

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