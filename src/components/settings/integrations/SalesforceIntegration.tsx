
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SalesforceIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [oauth, setOauth] = useState({
    clientId: "",
    clientSecret: "",
    redirectUri: window.location.origin + '/salesforce-callback',
    environment: "production" as "production" | "sandbox" | "custom"
  });
  const [syncSettings, setSyncSettings] = useState({
    syncDeals: true,
    syncContacts: true,
    syncProducts: false,
    syncCustomFields: true,
    syncInterval: "hourly" as "hourly" | "daily" | "weekly"
  });
  const { toast } = useToast();

  const handleConnect = () => {
    setIsConnecting(true);
    
    // Simulate OAuth flow
    setTimeout(() => {
      // Open a popup window for OAuth authentication
      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const oauthWindow = window.open(
        'about:blank', 
        'Salesforce OAuth', 
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (oauthWindow) {
        // Simulate the OAuth flow
        oauthWindow.document.write(`
          <html>
            <head>
              <title>Salesforce OAuth</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                h1 { color: #0176d3; }
                .container { max-width: 500px; margin: 0 auto; }
                .btn { background: #0176d3; color: white; border: none; padding: 10px 15px; 
                       border-radius: 4px; cursor: pointer; font-size: 16px; }
                .field { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                .logo { max-width: 180px; margin-bottom: 20px; }
                .footer { margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <img src="https://www.salesforce.com/content/dam/web/en_us/www/images/home/logo-salesforce.svg" class="logo" alt="Salesforce Logo">
                <h1>Connect to Salesforce</h1>
                <p>Authorize the application to access your Salesforce data</p>
                
                <div class="field">
                  <label for="username">Username</label>
                  <input type="text" id="username" placeholder="your-email@example.com">
                </div>
                
                <div class="field">
                  <label for="password">Password</label>
                  <input type="password" id="password" placeholder="Your password">
                </div>
                
                <button class="btn" id="authorize">Authorize</button>
                
                <div class="footer">
                  <p>This application will be able to:</p>
                  <ul>
                    <li>Access your basic information</li>
                    <li>View and manage your deals</li>
                    <li>Access your contacts and accounts</li>
                  </ul>
                </div>
              </div>
              
              <script>
                document.getElementById('authorize').addEventListener('click', function() {
                  document.body.innerHTML = '<div class="container"><h1>Authorization Successful!</h1><p>You can close this window now.</p></div>';
                  setTimeout(function() {
                    window.close();
                  }, 1500);
                });
              </script>
            </body>
          </html>
        `);
        
        // Simulate successful OAuth completion after a delay
        setTimeout(() => {
          setIsConnected(true);
          setIsConnecting(false);
          setShowConfig(true);
          
          toast({
            title: "Connected to Salesforce",
            description: "Your Salesforce account has been successfully connected.",
          });
        }, 3000);
      } else {
        setIsConnecting(false);
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Pop-up was blocked. Please allow pop-ups and try again.",
        });
      }
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setShowConfig(false);
    
    toast({
      title: "Disconnected from Salesforce",
      description: "Your Salesforce integration has been disabled.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your Salesforce integration settings have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salesforce Integration</CardTitle>
        <CardDescription>
          Connect your Salesforce account to sync deals, contacts, and other data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-muted-foreground">
              Connecting to Salesforce allows you to automatically sync your deals and contacts between platforms.
              Click the button below to start the OAuth connection process.
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full sm:w-auto"
            >
              {isConnecting ? "Connecting..." : "Connect to Salesforce"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Connected to Salesforce</h3>
                <p className="text-sm text-muted-foreground">
                  Your account is connected and syncing
                </p>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            
            {showConfig && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">OAuth Configuration</h3>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input 
                          id="clientId" 
                          value={oauth.clientId}
                          onChange={(e) => setOauth({...oauth, clientId: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <Input 
                          id="clientSecret" 
                          type="password"
                          value={oauth.clientSecret}
                          onChange={(e) => setOauth({...oauth, clientSecret: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="redirectUri">Redirect URI</Label>
                      <Input 
                        id="redirectUri" 
                        value={oauth.redirectUri}
                        onChange={(e) => setOauth({...oauth, redirectUri: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="environment">Environment</Label>
                      <Select 
                        value={oauth.environment}
                        onValueChange={(value) => setOauth({...oauth, environment: value as "production" | "sandbox" | "custom"})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="production">Production</SelectItem>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sync Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="syncDeals">Sync Deals</Label>
                        <div className="text-sm text-muted-foreground">
                          Sync your deals with Salesforce Opportunities
                        </div>
                      </div>
                      <Switch 
                        id="syncDeals"
                        checked={syncSettings.syncDeals}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, syncDeals: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="syncContacts">Sync Contacts</Label>
                        <div className="text-sm text-muted-foreground">
                          Sync your contacts with Salesforce Contacts
                        </div>
                      </div>
                      <Switch 
                        id="syncContacts"
                        checked={syncSettings.syncContacts}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, syncContacts: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="syncProducts">Sync Products</Label>
                        <div className="text-sm text-muted-foreground">
                          Sync your products with Salesforce Products
                        </div>
                      </div>
                      <Switch 
                        id="syncProducts"
                        checked={syncSettings.syncProducts}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, syncProducts: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="syncCustomFields">Sync Custom Fields</Label>
                        <div className="text-sm text-muted-foreground">
                          Sync your custom fields with Salesforce custom fields
                        </div>
                      </div>
                      <Switch 
                        id="syncCustomFields"
                        checked={syncSettings.syncCustomFields}
                        onCheckedChange={(checked) => setSyncSettings({...syncSettings, syncCustomFields: checked})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="syncInterval">Sync Interval</Label>
                      <Select 
                        value={syncSettings.syncInterval}
                        onValueChange={(value) => setSyncSettings({...syncSettings, syncInterval: value as "hourly" | "daily" | "weekly"})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

