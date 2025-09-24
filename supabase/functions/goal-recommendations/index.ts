import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context = {} } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'goal_suggestions':
        systemPrompt = `You are a relationship coach AI specializing in helping couples set meaningful goals together. 
        Provide 3-5 specific, actionable goal suggestions for couples based on their relationship stage and interests.
        Focus on goals that strengthen emotional connection, communication, shared experiences, and personal growth together.
        Format your response as a JSON array of objects with properties: title, description, category, timeframe.
        Categories can be: communication, adventure, personal_growth, intimacy, lifestyle, financial, family.
        Timeframes can be: short_term (1-3 months), medium_term (3-6 months), long_term (6+ months).`;
        
        userPrompt = `Generate relationship goal suggestions for a couple. Context: ${JSON.stringify(context)}`;
        break;

      case 'task_suggestions':
        systemPrompt = `You are a relationship coach AI helping couples break down their goals into actionable tasks.
        Provide 3-5 specific, practical tasks that help achieve the given goal.
        Focus on tasks that both partners can participate in or support each other with.
        Format your response as a JSON array of objects with properties: title, description, priority, estimated_time.
        Priority can be: high, medium, low.
        Estimated_time should be a human-readable string like "30 minutes", "1 hour", "1 week", etc.`;
        
        userPrompt = `Generate task suggestions for this relationship goal: "${context.goalDescription}". Context: ${JSON.stringify(context)}`;
        break;

      case 'progress_insights':
        systemPrompt = `You are a relationship coach AI providing insights on couple's goal progress.
        Analyze their current goals and tasks to provide encouraging insights and suggestions for improvement.
        Focus on celebrating progress, identifying patterns, and suggesting next steps.
        Format your response as a JSON object with properties: insight, encouragement, suggestions (array of strings).`;
        
        userPrompt = `Analyze this couple's goal progress and provide insights: ${JSON.stringify(context)}`;
        break;

      default:
        throw new Error('Invalid recommendation type');
    }

    console.log('Making OpenAI request for type:', type);

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    try {
      const parsedContent = JSON.parse(generatedContent);
      return new Response(JSON.stringify({ 
        success: true, 
        recommendations: parsedContent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        success: true, 
        recommendations: generatedContent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in goal-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});