import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create service role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate CSRF token
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken) {
      console.error('Missing CSRF token');
      return new Response(
        JSON.stringify({ error: 'Missing CSRF token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Invite code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} attempting to join with code ${code}`);

    // PREVENT DUPLICATE ACTIVE PAIRS: Check if joiner already has an active pair
    const { data: joinerActivePairs, error: joinerCheckError } = await supabaseAdmin
      .from('pairs')
      .select('id')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .limit(1);

    if (joinerCheckError) {
      console.error('Joiner active pair check error:', joinerCheckError);
      return new Response(
        JSON.stringify({ error: 'Error checking existing pairs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (joinerActivePairs && joinerActivePairs.length > 0) {
      return new Response(
        JSON.stringify({ error: 'You already have an active pair. Please disconnect first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up valid invite
    const { data: invites, error: inviteError } = await supabaseAdmin
      .from('pair_invites')
      .select('*, pairs(*)')
      .eq('code', code.toUpperCase())
      .gt('expires_at', new Date().toISOString());

    if (inviteError) {
      console.error('Invite lookup error:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Error checking invite code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!invites || invites.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invite code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const invite = invites[0];
    const pair = invite.pairs as any;

    // Validate pair status
    if (!pair) {
      return new Response(
        JSON.stringify({ error: 'Pair not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (pair.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'This pair is no longer available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (pair.user_b) {
      return new Response(
        JSON.stringify({ error: 'This pair has already been joined' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (pair.user_a === user.id) {
      return new Response(
        JSON.stringify({ error: 'You cannot join your own pair' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PREVENT DUPLICATE ACTIVE PAIRS: Check if inviter has any OTHER active pair
    const { data: inviterActivePairs, error: inviterCheckError } = await supabaseAdmin
      .from('pairs')
      .select('id')
      .or(`user_a.eq.${pair.user_a},user_b.eq.${pair.user_a}`)
      .eq('status', 'active')
      .neq('id', pair.id) // exclude current pair
      .limit(1);

    if (inviterCheckError) {
      console.error('Inviter active pair check error:', inviterCheckError);
      return new Response(
        JSON.stringify({ error: 'Error checking inviter pairs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (inviterActivePairs && inviterActivePairs.length > 0) {
      return new Response(
        JSON.stringify({ error: 'The inviter is already in another active pair. Invite is no longer valid.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update pair with user_b and set to active
    const { data: updatedPair, error: updateError } = await supabaseAdmin
      .from('pairs')
      .update({
        user_b: user.id,
        status: 'active'
      })
      .eq('id', pair.id)
      .select()
      .single();

    if (updateError) {
      console.error('Pair update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to join pair' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete the invite code
    await supabaseAdmin
      .from('pair_invites')
      .delete()
      .eq('code', code.toUpperCase());

    console.log(`User ${user.id} successfully joined pair ${pair.id}`);

    return new Response(
      JSON.stringify({ pair: updatedPair }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in join-pair:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
