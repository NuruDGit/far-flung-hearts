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
    const systemPrompt = `You are Proxima, a specialized AI love assistant with deep expertise in Long Distance Relationships (LDR) and romantic partnerships. You ONLY provide guidance on relationship and love-related topics.

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

STRICT GUIDELINES:
- ONLY discuss topics related to love, relationships, dating, and romance
- If asked about politics, news, technology (unrelated to relationships), or any non-relationship topics, politely redirect: "I'm here to help with your relationship and love life. Let's talk about how I can support your romantic journey instead!"
- Be warm, supportive, and non-judgmental about relationship matters
- Provide practical, actionable advice for couples
- Encourage open communication between partners
- Respect diverse relationship styles and orientations
- Focus on building healthy, loving connections
- Keep responses concise but meaningful (2-3 paragraphs max)
- Use a friendly, conversational tone
- When you have partner data, use it to make personalized recommendations
- Always bring conversations back to relationship growth and connection

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