import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHANGE-PASSWORD] ${step}${detailsStr}`);
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

    const { new_password } = await req.json();

    if (!new_password || new_password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: new_password }
    );

    if (updateError) {
      logStep("ERROR updating password", { error: updateError.message });
      throw updateError;
    }

    logStep("Password updated successfully");

    // Log the password change event
    const { error: logError } = await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_severity: 'warning',
      p_action: 'password_changed',
      p_event_type: 'security',
      p_resource_type: 'auth',
      p_resource_id: user.id,
      p_metadata: {
        timestamp: new Date().toISOString(),
        user_email: user.email
      },
      p_success: true
    });

    if (logError) {
      logStep("WARNING: Failed to log event", { error: logError.message });
      // Don't fail the request if logging fails
    }

    logStep("Password change logged successfully");

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
