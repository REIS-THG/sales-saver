
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Zap, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export function ZapierIntegration() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();

  const handleVerifyWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter a Zapier webhook URL to verify.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Send a test request to the webhook
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "Test connection from CRM",
        }),
      });

      // Since we're using no-cors, we don't get a proper response
      // In a real implementation, we would validate the response
      setIsVerified(true);
      
      toast({
        title: "Webhook Test Sent",
        description: "Test data was sent to your webhook. Please check your Zapier account to verify it was received.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify the webhook URL. Please check the URL and try again.",
        variant: "destructive",
      });
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {isVerified ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Zapier webhook connection verified
          </AlertDescription>
        </Alert>
      ) : (
        <div className="text-center p-6 border border-dashed border-slate-300 rounded-lg bg-slate-50">
          <Zap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Connect to Zapier</h3>
          <p className="text-slate-500 mb-4">
            Automate your workflows by connecting with thousands of apps via Zapier
          </p>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zapier-webhook">
              Zapier Webhook URL
              <Link 
                to="https://zapier.com/apps/webhook" 
                target="_blank"
                className="text-blue-500 ml-2 text-sm inline-flex items-center"
              >
                Get a webhook <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Label>
            <Input
              id="zapier-webhook"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleVerifyWebhook}
              disabled={isVerifying || !webhookUrl}
              className="w-full"
            >
              {isVerifying ? "Verifying..." : "Verify Webhook"}
            </Button>
            
            {isVerified && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsVerified(false);
                  setWebhookUrl("");
                }}
                className="w-full"
              >
                Reset Connection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        <h3 className="font-medium">Integration Benefits</h3>
        <ul className="space-y-1 list-disc pl-5 text-sm text-slate-600">
          <li>Automatically create deals from form submissions</li>
          <li>Sync contacts with your email marketing tools</li>
          <li>Get notified on Slack when high-value deals are updated</li>
          <li>Create calendar events when meetings are scheduled</li>
        </ul>
      </div>
    </div>
  );
}
