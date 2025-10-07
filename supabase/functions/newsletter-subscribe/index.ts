import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { email } = await req.json();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Store in database
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ 
        email: sanitizedEmail,
        source: 'blog'
      });

    // Handle duplicate email (unique constraint violation)
    if (error?.code === '23505') {
      return new Response(
        JSON.stringify({ 
          message: 'You are already subscribed to our newsletter!' 
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to subscribe. Please try again.' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // TODO: Send welcome email via Resend
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'Love Beyond Borders <newsletter@lovebeyondborders.com>',
    //   to: [sanitizedEmail],
    //   subject: 'Welcome to Love Beyond Borders Newsletter',
    //   html: `<h1>Welcome!</h1><p>Thank you for subscribing to our newsletter.</p>`
    // });
    
    console.log('New subscriber:', sanitizedEmail);

    return new Response(
      JSON.stringify({ 
        message: 'Successfully subscribed! Welcome to our community.' 
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in newsletter-subscribe function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
