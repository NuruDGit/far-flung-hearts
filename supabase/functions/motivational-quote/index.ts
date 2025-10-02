import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { mood, moodLabel } = await req.json();

    let systemPrompt = '';
    switch (moodLabel.toLowerCase()) {
      case 'excited':
        systemPrompt = 'Generate a short, uplifting motivational quote (max 15 words) that celebrates excitement and energy. Make it inspiring and positive.';
        break;
      case 'happy':
        systemPrompt = 'Generate a short, joyful motivational quote (max 15 words) that amplifies happiness and gratitude. Make it warm and encouraging.';
        break;
      case 'loving':
        systemPrompt = 'Generate a short, heartwarming motivational quote (max 15 words) about love, connection, and relationships. Make it tender and meaningful.';
        break;
      case 'neutral':
        systemPrompt = 'Generate a short, balanced motivational quote (max 15 words) about finding peace and balance. Make it calming and centered.';
        break;
      case 'sad':
        systemPrompt = 'Generate a short, gentle motivational quote (max 15 words) that offers comfort and hope during difficult times. Make it compassionate and uplifting.';
        break;
      case 'crying':
        systemPrompt = 'Generate a short, comforting motivational quote (max 15 words) about healing and resilience. Make it deeply empathetic and hopeful.';
        break;
      case 'angry':
        systemPrompt = 'Generate a short, calming motivational quote (max 15 words) about managing anger and finding inner peace. Make it soothing and wise.';
        break;
      case 'tired':
        systemPrompt = 'Generate a short, restoring motivational quote (max 15 words) about rest, self-care, and renewal. Make it gentle and nurturing.';
        break;
      case 'anxious':
        systemPrompt = 'Generate a short, reassuring motivational quote (max 15 words) about overcoming anxiety and finding calm. Make it grounding and peaceful.';
        break;
      default:
        systemPrompt = 'Generate a short, universal motivational quote (max 15 words) that inspires and uplifts. Make it positive and encouraging.';
    }

    console.log('Generating quote for mood:', moodLabel);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate a unique motivational quote for someone feeling ${moodLabel}. Current timestamp: ${Date.now()}. Return ONLY the quote text without quotation marks, attribution, or any other formatting.`
          }
        ],
        max_completion_tokens: 100
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI full response:', JSON.stringify(data, null, 2));
    
    const quote = data.choices?.[0]?.message?.content?.trim();
    
    if (!quote) {
      console.error('No quote content in response, using fallback');
      return new Response(JSON.stringify({ 
        quote: 'Every moment is a fresh beginning.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Generated quote:', quote);

    return new Response(JSON.stringify({ quote }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in motivational-quote function:', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      quote: 'Every moment is a fresh beginning.' // Fallback quote
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});