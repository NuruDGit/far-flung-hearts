import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { gameType, player1Answers, player2Answers, player1Score, player2Score } = await req.json();
    
    console.log('Generating summary for game:', gameType);

    const systemPrompt = `You are a fun, encouraging relationship coach analyzing a couple's game session. Create an engaging, personalized summary that:
1. Celebrates their connection and compatibility
2. Highlights fun moments or interesting answers
3. Provides playful insights about their relationship
4. Encourages more quality time together
5. Keep it warm, positive, and relationship-focused
6. Use emojis to make it fun and engaging

Keep the summary to 3-4 sentences max.`;

    const userPrompt = `Game: ${gameType}
Player 1 Score: ${player1Score}
Player 2 Score: ${player2Score}
Player 1 Answers: ${JSON.stringify(player1Answers)}
Player 2 Answers: ${JSON.stringify(player2Answers)}

Create a warm, fun summary of their game session.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;
    
    console.log('Generated summary successfully');

    return new Response(JSON.stringify({ 
      success: true,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-game-summary function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});