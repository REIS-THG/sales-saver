
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionPlanCard, type Plan } from "@/components/subscription/SubscriptionPlanCard";
import { subscriptionPlans } from "@/components/subscription/plans-data";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Load Stripe Buy Button Script
const loadStripeScript = () => {
  const script = document.createElement('script');
  script.src = 'https://js.stripe.com/v3/buy-button.js';
  script.async = true;
  document.body.appendChild(script);
};

export default function Subscription() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadStripeScript();
  }, []);

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
      // The buy button will handle the pro subscription
      const buyButton = document.createElement('stripe-buy-button');
      buyButton.setAttribute('buy-button-id', 'buy_btn_1QtdHaDaihWQpHM6vSaLMfRh');
      buyButton.setAttribute('publishable-key', 'pk_live_51Qtb8WDaihWQpHM6zckr56vWVg2BeBX6sFXA9FgOrmbdN3H5HY3GBMiO3DaO5rYOuCDsOjUrQAQV9xdbtvh3VSXR005zCbf5Dz');
      
      // Create a modal to display the buy button
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.backgroundColor = 'white';
      modal.style.padding = '20px';
      modal.style.borderRadius = '8px';
      modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      modal.style.zIndex = '1000';

      // Add close button
      const closeButton = document.createElement('button');
      closeButton.textContent = '×';
      closeButton.style.position = 'absolute';
      closeButton.style.right = '10px';
      closeButton.style.top = '10px';
      closeButton.style.border = 'none';
      closeButton.style.background = 'none';
      closeButton.style.fontSize = '24px';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
      };

      // Add overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '999';

      modal.appendChild(closeButton);
      modal.appendChild(buyButton);
      document.body.appendChild(overlay);
      document.body.appendChild(modal);
    }

    if (planType === "free") {
      toast({
        title: "Success",
        description: "Your subscription has been cancelled. Changes will take effect at the end of your billing period."
      });
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
