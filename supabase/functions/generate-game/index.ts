import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const gamePrompts = {
  'truth_or_dare': {
    system: "You are a creative relationship expert creating fun, spicy, and appropriate Truth or Dare questions for couples. Create questions that help couples learn more about each other and have fun together. Keep it playful, intimate but not explicit. Return JSON array of 10 questions.",
    user: "Generate 10 Truth or Dare questions for couples. Mix of 5 truth questions and 5 dare challenges. Format: {\"questions\": [{\"type\": \"truth\", \"question\": \"...\"}, {\"type\": \"dare\", \"question\": \"...\"}]}"
  },
  'never_have_i_ever': {
    system: "You are a creative relationship counselor creating fun 'Never Have I Ever' questions for couples. Focus on relationship experiences, travel, food, life adventures. Keep it fun and appropriate. Return JSON array of 10 questions.",
    user: "Generate 10 'Never Have I Ever' questions perfect for couples to learn about each other's past experiences. Format: {\"questions\": [\"Never have I ever...\", ...]}"
  },
  'couple_quiz': {
    system: "You are a relationship expert creating personalized quiz questions for couples. Questions should be about preferences, memories, and understanding of each other. Return JSON array of 10 questions.",
    user: "Generate 10 quiz questions for couples to test how well they know each other. Include questions about favorites, preferences, and predictions. Format: {\"questions\": [{\"question\": \"What is your partner's favorite...\", \"category\": \"preferences\"}]}"
  },
  'would_you_rather': {
    system: "You are a creative game designer creating fun 'Would You Rather' questions for couples. Make them thought-provoking, fun, and relationship-focused. Return JSON array of 10 questions.",
    user: "Generate 10 'Would You Rather' questions for couples. Mix romantic, adventurous, and lifestyle topics. Format: {\"questions\": [{\"optionA\": \"...\", \"optionB\": \"...\"}]}"
  }
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

    const { gameType } = await req.json();
    
    if (!gamePrompts[gameType as keyof typeof gamePrompts]) {
      throw new Error('Invalid game type');
    }

    const prompt = gamePrompts[gameType as keyof typeof gamePrompts];
    console.log('Generating game content for:', gameType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        max_completion_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = JSON.parse(data.choices[0].message.content);
    
    console.log('Generated game content successfully');

    return new Response(JSON.stringify({ 
      success: true,
      gameData: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-game function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});