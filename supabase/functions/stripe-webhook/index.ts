import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2025-08-27.basil'
});

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('No stripe-signature header found');
      return new Response('No signature', { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    console.log('Webhook event received:', event.type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription, supabase);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;
      
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
  try {
    console.log('Handling subscription update:', subscription.id);
    
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    if (!customer.email) {
      console.error('Customer has no email:', subscription.customer);
      return;
    }

    const { error } = await supabase
      .from('subscription_status')
      .upsert({
        customer_email: customer.email,
        subscription_id: subscription.id,
        status: subscription.status,
        product_id: subscription.items.data[0]?.price?.product,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      }, {
        onConflict: 'subscription_id'
      });

    if (error) {
      console.error('Error updating subscription status:', error);
    } else {
      console.log('Subscription status updated successfully');
      
      // Log subscription change
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .maybeSingle();
        
        if (profile) {
          await supabase.rpc('log_security_event', {
            p_user_id: profile.id,
            p_severity: 'info',
            p_action: 'subscription_updated',
            p_event_type: 'subscription_change',
            p_resource_type: 'subscription',
            p_resource_id: null,
            p_metadata: {
              subscription_id: subscription.id,
              status: subscription.status,
              product_id: subscription.items.data[0]?.price?.product,
              cancel_at_period_end: subscription.cancel_at_period_end
            },
            p_success: true
          });
        }
      } catch (logError) {
        console.error('Failed to log subscription update:', logError);
      }
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdate:', error);
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription, supabase: any) {
  try {
    console.log('Handling subscription cancellation:', subscription.id);
    
    const { error } = await supabase
      .from('subscription_status')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id);

    if (error) {
      console.error('Error updating cancelled subscription:', error);
    } else {
      console.log('Subscription cancelled successfully');
      
      // Log subscription cancellation
      try {
        const { data: statusData } = await supabase
          .from('subscription_status')
          .select('customer_email')
          .eq('subscription_id', subscription.id)
          .maybeSingle();
        
        if (statusData) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', statusData.customer_email)
            .maybeSingle();
          
          if (profile) {
            await supabase.rpc('log_security_event', {
              p_user_id: profile.id,
              p_severity: 'warning',
              p_action: 'subscription_cancelled',
              p_event_type: 'subscription_change',
              p_resource_type: 'subscription',
              p_resource_id: null,
              p_metadata: {
                subscription_id: subscription.id,
                cancelled_at: new Date().toISOString()
              },
              p_success: true
            });
          }
        }
      } catch (logError) {
        console.error('Failed to log subscription cancellation:', logError);
      }
      
      // TODO: Send cancellation email via Resend
    }
  } catch (error) {
    console.error('Error in handleSubscriptionCancelled:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  try {
    console.log('Handling payment failure for invoice:', invoice.id);
    
    const { error } = await supabase
      .from('payment_failures')
      .insert({
        customer_id: invoice.customer as string,
        invoice_id: invoice.id,
        amount: invoice.amount_due,
        reason: invoice.last_finalization_error?.message || 'Unknown error'
      });

    if (error) {
      console.error('Error logging payment failure:', error);
    } else {
      console.log('Payment failure logged successfully');
      // TODO: Send payment failure notification via Resend
    }
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session, supabase: any) {
  try {
    console.log('Handling checkout completion:', session.id);
    
    // If this is a subscription checkout, the subscription events will handle it
    // If this is a one-time payment, you can handle it here
    
    if (session.mode === 'subscription' && session.subscription) {
      console.log('Subscription created via checkout:', session.subscription);
      // The subscription.created event will handle the database update
    } else if (session.mode === 'payment') {
      console.log('One-time payment completed:', session.payment_intent);
      // TODO: Handle one-time payment completion (e.g., update orders table)
    }
  } catch (error) {
    console.error('Error in handleCheckoutComplete:', error);
  }
}
