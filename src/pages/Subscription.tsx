
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started",
      features: [
        "Up to 5 deals",
        "1 deal analysis per month",
        "1 saved report",
        "Basic deal tracking",
        "Email support"
      ],
      limitations: [
        "Limited analytics",
        "No AI-powered insights",
        "No custom fields",
        "No team collaboration"
      ],
      current: user.subscription_status === "free"
    },
    {
      name: "Pro",
      price: "30",
      billingPeriod: "per user/month",
      priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
      description: "For growing sales teams",
      features: [
        "Unlimited deals",
        "Unlimited deal analysis",
        "Unlimited saved reports",
        "Advanced analytics",
        "Priority support",
        "Custom fields",
        "AI-powered insights",
        "Team collaboration",
        "Export capabilities",
        "API access"
      ],
      current: user.subscription_status === "pro"
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Custom contract terms",
        "Dedicated account manager",
        "Custom integrations",
        "Enhanced security features",
        "SSO integration",
        "Custom training sessions",
        "SLA guarantees",
        "Audit logs",
        "Volume discounts"
      ],
      contact: true,
      current: user.subscription_status === "enterprise"
    }
  ];

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
          <Card 
            key={plan.name} 
            className={`flex flex-col ${plan.current ? 'border-primary ring-2 ring-primary' : ''} ${plan.name === 'Pro' ? 'md:-mt-4 md:mb-4' : ''}`}
          >
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                {plan.name}
                {plan.name === 'Pro' && (
                  <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    POPULAR
                  </span>
                )}
              </CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {plan.price === "Custom" ? "Contact Us" : `$${plan.price}`}
                  </span>
                  {plan.billingPeriod && (
                    <span className="text-sm text-muted-foreground">/{plan.billingPeriod}</span>
                  )}
                </div>
                <p>{plan.description}</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.limitations && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Limitations:</p>
                    {plan.limitations.map((limitation) => (
                      <div key={limitation} className="flex items-start gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Upgrade to Pro to remove this limitation</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {plan.current ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade(plan.name.toLowerCase() as "free" | "pro" | "enterprise")}
                  variant={plan.name === "Free" ? "outline" : "default"}
                >
                  {plan.contact ? "Contact Sales" : `Get ${plan.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
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
