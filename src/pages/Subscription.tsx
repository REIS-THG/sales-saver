
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionPlanCard, type Plan } from "@/components/subscription/SubscriptionPlanCard";
import { subscriptionPlans } from "@/components/subscription/plans-data";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Subscription() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Stripe failed to initialize");
        }

        const { data: { sessionId }, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            priceId: plans[1].priceId,
            userId: user.user_id,
            customerEmail: user.email
          }
        });

        if (error) {
          throw error;
        }

        // Redirect to Stripe Checkout
        const result = await stripe.redirectToCheckout({
          sessionId
        });

        if (result.error) {
          throw result.error;
        }

      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start checkout process. Please try again later."
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

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include our core features: Deal tracking, Basic analytics, and Email support.
          <br />
          Questions? Contact our sales team at{" "}
          <a href="mailto:sales@example.com" className="text-primary hover:underline">
            sales@example.com
          </a>
        </p>
      </div>
    </div>
  );
}
