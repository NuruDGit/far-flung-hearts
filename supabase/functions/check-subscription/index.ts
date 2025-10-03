import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Fallback: check local subscriptions table for pair-based plan
async function checkLocalSubscription(supabaseClient: any, userId: string) {
  try {
    logStep("Checking local subscription fallback", { userId });

    const { data: pair, error: pairError } = await supabaseClient
      .from('pairs')
      .select('id')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (pairError) {
      logStep("No active pair found for user (fallback)", { error: pairError.message });
      return null;
    }

    const { data: sub, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('plan, renews_on')
      .eq('pair_id', pair.id)
      .limit(1)
      .single();

    if (subError || !sub) {
      logStep("No local subscription record found", { error: subError?.message });
      return null;
    }

    let tier: 'free' | 'premium' | 'super_premium' = 'free';
    // Map DB plans to app tiers
    if (sub.plan === 'pro' || sub.plan === 'premium') tier = 'premium';
    if (sub.plan === 'super_premium') tier = 'super_premium';

    if (tier !== 'free') {
      logStep("Local subscription detected", { dbPlan: sub.plan, mappedTier: tier });
      return {
        subscribed: true,
        tier,
        product_id: null,
        subscription_end: sub.renews_on ?? null,
      };
    }

    return null;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    logStep("Error during local subscription check", { message });
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found, trying local subscription fallback");
      const local = await checkLocalSubscription(supabaseClient, user.id);
      if (local) {
        return new Response(JSON.stringify(local), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      logStep("No local subscription either, returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: 'free',
        product_id: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;
    let tier = 'free';

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      productId = subscription.items.data[0].price.product;
      
      // Map product ID to tier
      if (productId === 'prod_T9p21HN7eGrMXW') {
        tier = 'premium';
      } else if (productId === 'prod_T9p3BJuCvkTJaW') {
        tier = 'super_premium';
      }
      
      logStep("Determined subscription tier", { productId, tier });

      // PROPAGATE TO PAIR: If user has active pair, upsert subscriptions row for that pair
      const { data: pairData } = await supabaseClient
        .from('pairs')
        .select('id')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (pairData && pairData.length > 0) {
        const pairId = pairData[0].id;
        logStep("Active pair detected, propagating subscription", { pairId });
        const planTier = tier === 'super_premium' ? 'super_premium' : 'pro';
        await supabaseClient
          .from('subscriptions')
          .upsert({
            pair_id: pairId,
            plan: planTier,
            renews_on: subscriptionEnd ? subscriptionEnd.split('T')[0] : null,
          }, { onConflict: 'pair_id' });
        logStep("Subscription propagated to pair", { pairId, planTier });
      }
    } else {
      logStep("No active Stripe subscription found, trying local fallback");
      const local = await checkLocalSubscription(supabaseClient, user.id);
      if (local) {
        return new Response(JSON.stringify(local), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier,
      product_id: productId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
