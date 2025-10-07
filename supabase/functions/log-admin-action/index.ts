import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LOG-ADMIN-ACTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logStep("Authentication failed", { error: userError?.message });
      throw new Error('Unauthorized');
    }

    logStep("User authenticated", { userId: user.id });

    const { target_user_id, old_role, new_role, action } = await req.json();

    if (!target_user_id || !action) {
      throw new Error('target_user_id and action are required');
    }

    // Log the admin action
    const { error: logError } = await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_severity: 'warning',
      p_action: action,
      p_event_type: 'admin_action',
      p_resource_type: 'user_roles',
      p_resource_id: target_user_id,
      p_metadata: {
        admin_id: user.id,
        target_user_id,
        old_role,
        new_role,
        action
      },
      p_success: true
    });

    if (logError) {
      logStep("ERROR logging event", { error: logError.message });
      throw logError;
    }

    logStep("Admin action logged successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
