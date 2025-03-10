
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionPlanCard } from "@/components/subscription/SubscriptionPlanCard";
import { subscriptionPlans } from "@/components/subscription/plans-data";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("plans");
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro" | "enterprise">("free");
  
  useEffect(() => {
    if (user?.subscription_status) {
      setCurrentPlan(user.subscription_status);
    }
  }, [user]);

  const handleUpgrade = (planType: "free" | "pro" | "enterprise") => {
    if (planType === "enterprise") {
      setActiveTab("contact");
    } else {
      // Handle plan upgrade
      console.log(`Upgrading to ${planType} plan`);
    }
  };

  if (isLoading) {
    return <ReportsLoadingState />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate(-1)} variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="contact">Contact Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3 lg:gap-8 pt-6">
            {subscriptionPlans.map((plan) => (
              <SubscriptionPlanCard
                key={plan.name}
                plan={{
                  ...plan,
                  current: plan.name.toLowerCase() === currentPlan
                }}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Manage your billing details and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Billing information content */}
              <p className="text-center py-6 text-muted-foreground">Billing management features are currently in development.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Sales</CardTitle>
              <CardDescription>Get in touch with our sales team for enterprise pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact form */}
              <p className="text-center py-6 text-muted-foreground">Enterprise plan contact form is currently in development.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setActiveTab("plans")} className="w-full">Back to Plans</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
