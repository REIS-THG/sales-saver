
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

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
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
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
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
          throw updateError
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user with this stripe customer ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userError || !userData) {
          throw new Error('No user found with this customer ID')
        }

        // Update subscription status based on the subscription object
        const status = subscription.status === 'active' ? 'pro' : 'free'
        const endDate = subscription.cancel_at_period_end ? new Date(subscription.current_period_end * 1000) : null

        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_status: status,
            subscription_end_date: endDate
          })
          .eq('user_id', userData.user_id)

        if (updateError) {
          throw updateError
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user with this stripe customer ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (userError || !userData) {
          throw new Error('No user found with this customer ID')
        }

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
          throw updateError
        }

        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})
