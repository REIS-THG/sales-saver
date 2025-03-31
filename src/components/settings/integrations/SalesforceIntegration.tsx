
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Cloud, AlertCircle, CheckCircle2 } from "lucide-react";

export function SalesforceIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  const handleOAuthConnect = () => {
    setIsConnecting(true);
    
    // Simulate OAuth flow
    // In a real implementation, this would open a popup window to the Salesforce OAuth endpoint
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast({
        title: "Connected to Salesforce",
        description: "Your Salesforce account has been successfully connected",
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Disconnected from Salesforce",
      description: "Your Salesforce integration has been disconnected",
      variant: "destructive",
    });
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your Salesforce account is connected and syncing data
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium">Automatic Sync</h3>
              <p className="text-sm text-slate-500">Sync deals and contacts automatically</p>
            </div>
            <Switch checked={true} />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <h3 className="font-medium">Two-way Sync</h3>
              <p className="text-sm text-slate-500">Changes in either system will be reflected in both</p>
            </div>
            <Switch checked={true} />
          </div>
          
          <Button variant="outline" className="w-full" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? "Hide" : "Show"} Advanced Settings
          </Button>
          
          {showAdvanced && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instance-url">Salesforce Instance URL</Label>
                  <Input id="instance-url" value="https://mycompany.my.salesforce.com" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-version">API Version</Label>
                  <Input id="api-version" value="v56.0" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Debug Mode</h3>
                    <p className="text-sm text-slate-500">Enable detailed logging</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </CardContent>
            </Card>
          )}
          
          <Button variant="destructive" onClick={handleDisconnect}>
            Disconnect from Salesforce
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border border-dashed border-slate-300 rounded-lg bg-slate-50">
        <Cloud className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Connect to Salesforce</h3>
        <p className="text-slate-500 mb-4">
          Sync your deals, contacts, and opportunities with Salesforce CRM
        </p>
        <Button 
          onClick={handleOAuthConnect} 
          disabled={isConnecting}
          className="bg-[#00A1E0] hover:bg-[#0078BD]"
        >
          {isConnecting ? "Connecting..." : "Connect with OAuth"}
        </Button>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Integration Benefits</h3>
        <ul className="space-y-1 list-disc pl-5 text-sm text-slate-600">
          <li>Automatic deal and contact synchronization</li>
          <li>Keep opportunity stages in sync</li>
          <li>Map custom fields between systems</li>
          <li>Bidirectional updates</li>
        </ul>
      </div>
    </div>
  );
}
