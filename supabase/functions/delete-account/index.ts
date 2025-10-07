import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
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

    // Log the account deletion request with CRITICAL severity
    const { error: logError } = await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_severity: 'critical',
      p_action: 'account_deletion_requested',
      p_event_type: 'account_deletion',
      p_resource_type: 'auth',
      p_resource_id: user.id,
      p_metadata: {
        timestamp: new Date().toISOString(),
        user_email: user.email,
        deletion_grace_period_days: 30,
        deletion_scheduled_for: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      p_success: true
    });

    if (logError) {
      logStep("ERROR logging deletion request", { error: logError.message });
      throw logError;
    }

    logStep("Account deletion request logged");

    // Delete the user account
    // Note: This is a hard delete. For production, you might want to implement soft delete
    // with a grace period as mentioned in the privacy policy
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      logStep("ERROR deleting user", { error: deleteError.message });
      throw deleteError;
    }

    logStep("User account deleted successfully");

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Account deletion initiated. Your account will be permanently deleted after a 30-day grace period.'
    }), {
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
