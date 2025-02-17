
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PlanFeature {
  feature: string;
}

interface PlanLimitation {
  limitation: string;
}

export interface Plan {
  name: string;
  price: string;
  billingPeriod?: string;
  priceId?: string;
  description: string;
  features: string[];
  limitations?: string[];
  contact?: boolean;
  current: boolean;
}

interface SubscriptionPlanCardProps {
  plan: Plan;
  onUpgrade: (planType: "free" | "pro" | "enterprise") => void;
}

export function SubscriptionPlanCard({ plan, onUpgrade }: SubscriptionPlanCardProps) {
  const Feature = ({ feature }: PlanFeature) => (
    <div className="flex items-start gap-2">
      <Check className="h-5 w-5 text-primary mt-0.5" />
      <span>{feature}</span>
    </div>
  );

  const Limitation = ({ limitation }: PlanLimitation) => (
    <div className="flex items-start gap-2">
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
  );

  return (
    <Card 
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
            <Feature key={feature} feature={feature} />
          ))}
          {plan.limitations && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Limitations:</p>
              {plan.limitations.map((limitation) => (
                <Limitation key={limitation} limitation={limitation} />
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
        ) : plan.name === "Pro" ? (
          <stripe-buy-button
            buy-button-id="buy_btn_1QtdHaDaihWQpHM6vSaLMfRh"
            publishable-key="pk_live_51Qtb8WDaihWQpHM6zckr56vWVg2BeBX6sFXA9FgOrmbdN3H5HY3GBMiO3DaO5rYOuCDsOjUrQAQV9xdbtvh3VSXR005zCbf5Dz"
            className="w-full"
          />
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onUpgrade(plan.name.toLowerCase() as "free" | "pro" | "enterprise")}
            variant={plan.name === "Free" ? "outline" : "default"}
          >
            {plan.contact ? "Contact Sales" : `Get ${plan.name}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
