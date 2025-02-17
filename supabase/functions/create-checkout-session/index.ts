
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Stripe } from 'https://esm.sh/stripe@12.13.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request to create checkout session');
    
    const { priceId, userId, customerEmail } = await req.json()
    console.log('Request data:', { priceId, userId, customerEmail });

    // Validate required fields
    if (!priceId) {
      throw new Error('Price ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!customerEmail) {
      throw new Error('Customer email is required');
    }

    const origin = req.headers.get('origin') || 'http://localhost:5173';
    console.log('Origin:', origin);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription?canceled=true`,
      customer_email: customerEmail,
      client_reference_id: userId,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
    })

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
