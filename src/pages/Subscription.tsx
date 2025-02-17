
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionPlanCard, type Plan } from "@/components/subscription/SubscriptionPlanCard";
import { subscriptionPlans } from "@/components/subscription/plans-data";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

let stripePromise: Promise<any> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    try {
      const { data, error } = await supabase.functions.invoke('get-stripe-key');
      
      if (error) {
        throw error;
      }

      if (!data?.publishableKey) {
        throw new Error('Could not retrieve Stripe publishable key');
      }

      console.log('Stripe Key Status: Present');
      console.log('Initializing Stripe with key:', data.publishableKey.slice(0, 8) + '...');
      
      stripePromise = loadStripe(data.publishableKey);
    } catch (error) {
      console.error('Stripe Initialization Error:', error);
      throw error;
    }
  }
  return stripePromise;
};

export default function Subscription() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      toast({
        title: "Success!",
        description: "Your subscription has been activated. Welcome to Pro!",
      });
    } else if (canceled === 'true') {
      toast({
        title: "Subscription canceled",
        description: "You can upgrade anytime when you're ready.",
      });
    }
  }, [searchParams, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const plans: Plan[] = subscriptionPlans.map(plan => ({
    ...plan,
    current: user.subscription_status === plan.name.toLowerCase()
  }));

  const handleUpgrade = async (planType: "free" | "pro" | "enterprise") => {
    if (planType === "enterprise") {
      window.location.href = `mailto:enterprise@example.com?subject=Enterprise Plan Inquiry&body=I'm interested in learning more about the Enterprise plan.`;
      return;
    }

    if (planType === "pro") {
      try {
        const stripe = await getStripe();
        const proPlan = plans.find(p => p.name.toLowerCase() === 'pro');
        
        if (!proPlan?.priceId) {
          throw new Error('Pro plan price ID not found');
        }

        if (!user.user_id || !user.email) {
          throw new Error('User information is missing');
        }

        console.log('Creating checkout session with:', {
          priceId: proPlan.priceId,
          userId: user.user_id,
          customerEmail: user.email
        });

        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            priceId: proPlan.priceId,
            userId: user.user_id,
            customerEmail: user.email
          }
        });

        if (error) {
          console.error('Checkout session error:', error);
          throw error;
        }

        if (!data?.sessionId) {
          throw new Error('No session ID returned from the server');
        }

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
          sessionId: data.sessionId
        });

        if (result?.error) {
          throw result.error;
        }

      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to start checkout process. Please try again later."
        });
      }
    }

    if (planType === "free") {
      try {
        const { error } = await supabase.functions.invoke('cancel-subscription', {
          body: { userId: user.user_id }
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Your subscription has been cancelled. Changes will take effect at the end of your billing period."
        });

      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to cancel subscription. Please try again later."
        });
      }
    }
  };

  return (
    <div className="container py-10 max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground">
          Scale your sales pipeline with the right tools for your team
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <SubscriptionPlanCard 
            key={plan.name} 
            plan={plan}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>
    </div>
  );
}
