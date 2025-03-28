
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

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
  productId?: string;
  description: string;
  features: string[];
  limitations?: string[];
  contact?: boolean;
  current: boolean;
  directLink?: string;
}

interface SubscriptionPlanCardProps {
  plan: Plan;
  onUpgrade: (planType: "free" | "pro" | "enterprise") => void;
}

export function SubscriptionPlanCard({ plan, onUpgrade }: SubscriptionPlanCardProps) {
  const isMobile = useIsMobile();

  const Feature = ({ feature }: PlanFeature) => (
    <div className="flex items-start gap-2">
      <Check className="h-5 w-5 text-primary mt-0.5" />
      <span className={isMobile ? "text-sm" : ""}>{feature}</span>
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

  const handleUpgrade = () => {
    if (plan.name === "Pro" && plan.directLink) {
      window.open(plan.directLink, "_blank");
    } else {
      onUpgrade(plan.name.toLowerCase() as "free" | "pro" | "enterprise");
    }
  };

  return (
    <Card 
      className={`flex flex-col ${plan.current ? 'border-primary ring-2 ring-primary' : ''} ${plan.name === 'Pro' && !isMobile ? 'md:-mt-4 md:mb-4' : ''}`}
    >
      <CardHeader className={isMobile ? "p-4" : ""}>
        <CardTitle className={`${isMobile ? "text-xl" : "text-2xl"} flex items-center gap-2`}>
          {plan.name}
          {plan.name === 'Pro' && (
            <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded-full">
              POPULAR
            </span>
          )}
        </CardTitle>
        <CardDescription className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold`}>
              {plan.price === "Custom" ? "Contact Us" : `$${plan.price}`}
            </span>
            {plan.billingPeriod && (
              <span className="text-sm text-muted-foreground">/{plan.billingPeriod}</span>
            )}
          </div>
          <p className={isMobile ? "text-sm" : ""}>{plan.description}</p>
        </CardDescription>
      </CardHeader>
      <CardContent className={`flex-1 ${isMobile ? "p-4 pt-0" : ""}`}>
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <Feature key={feature} feature={feature} />
          ))}
          {plan.limitations && (
            <div className="mt-4 pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">Limitations:</p>
              {plan.limitations.map((limitation) => (
                <Limitation key={limitation} limitation={limitation} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className={isMobile ? "p-4" : "p-6"}>
        {plan.current ? (
          <Button className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleUpgrade}
            variant={plan.name === "Free" ? "outline" : "default"}
          >
            {plan.contact ? "Contact Sales" : `Get ${plan.name}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
