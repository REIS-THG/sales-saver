
import { useState, useEffect } from "react";
import { MainHeader } from "@/components/layout/MainHeader";
import { DealSourcingForm } from "@/components/deals/DealSourcingForm";
import { Card } from "@/components/ui/card";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DealSourcing = () => {
  const { subscriptionTier, isLoading } = useSubscriptionStatus();
  const [showLimitedFeatures, setShowLimitedFeatures] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && subscriptionTier !== 'pro') {
      setShowLimitedFeatures(true);
    }
  }, [isLoading, subscriptionTier]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deal Sourcing</h1>
          <p className="text-sm text-gray-500">Find and extract potential deals from websites and other sources</p>
        </div>
        
        {showLimitedFeatures && (
          <Alert variant="default" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Limited functionality</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>You're using the free version which limits deal extraction to 3 results per source and doesn't support batch processing.</p>
              <div>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate('/subscription')}
                  className="mt-2"
                >
                  Upgrade to Pro
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="p-6">
          <DealSourcingForm subscriptionTier={subscriptionTier} />
        </Card>
      </main>
    </div>
  );
};

export default DealSourcing;
