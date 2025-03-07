
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SubscriptionAlert() {
  const navigate = useNavigate();
  
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Pro Subscription Required</AlertTitle>
      <AlertDescription className="flex items-center gap-2">
        Document generation features require a Pro subscription.
        <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/subscription")}>
          Upgrade now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
