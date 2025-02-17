
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Stripe } from 'https://esm.sh/stripe@12.13.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { 
      status: 400,
      headers: corsHeaders
    })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret!
      )
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(
        `Webhook signature verification failed: ${err.message}`, 
        { 
          status: 400,
          headers: corsHeaders
        }
      )
    }

    console.log(`Event type: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const userId = session.client_reference_id

        if (!userId) {
          throw new Error('No user ID found in session metadata')
        }

        console.log(`Processing completed checkout for user ${userId}`)

        // Update user subscription details
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: 'pro',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_end_date: null // Reset end date since it's now active
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('Error updating user subscription:', updateError)
          throw updateError
        }

        console.log(`Successfully updated subscription for user ${userId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log(`Processing subscription update for customer ${customerId}`)

        // Get user with this stripe customer ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userError || !userData) {
          console.error('Error finding user:', userError)
          throw new Error('No user found with this customer ID')
        }

        // Update subscription status based on the subscription object
        const status = subscription.status === 'active' ? 'pro' : 'free'
        const endDate = subscription.cancel_at_period_end ? new Date(subscription.current_period_end * 1000) : null

        console.log(`Updating subscription status to ${status} for user ${userData.user_id}`)

        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: status,
            subscription_end_date: endDate
          })
          .eq('user_id', userData.user_id)

        if (updateError) {
          console.error('Error updating subscription status:', updateError)
          throw updateError
        }

        console.log(`Successfully updated subscription status for user ${userData.user_id}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log(`Processing subscription deletion for customer ${customerId}`)

        // Get user with this stripe customer ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userError || !userData) {
          console.error('Error finding user:', userError)
          throw new Error('No user found with this customer ID')
        }

        console.log(`Reverting to free plan for user ${userData.user_id}`)

        // Update user to free plan
        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: 'free',
            subscription_end_date: null,
            stripe_subscription_id: null
          })
          .eq('user_id', userData.user_id)

        if (updateError) {
          console.error('Error updating user to free plan:', updateError)
          throw updateError
        }

        console.log(`Successfully reverted to free plan for user ${userData.user_id}`)
        break
      }
    }

    return new Response(
      JSON.stringify({ received: true }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
