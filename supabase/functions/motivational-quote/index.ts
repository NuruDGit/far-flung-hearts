import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

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
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set');
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

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate a unique motivational quote for someone feeling ${moodLabel}. Add some randomness with current timestamp: ${Date.now()}. Return only the quote text, no quotation marks or extra formatting.`
          }
        ],
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 100,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Perplexity response:', data);
    
    const quote = data.choices?.[0]?.message?.content?.trim() || 'Every moment is a fresh beginning.';

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