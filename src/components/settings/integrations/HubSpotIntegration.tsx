
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Laptop, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function HubSpotIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const { toast } = useToast();

  // HubSpot OAuth configuration
  // The client ID should be added through Supabase secrets
  const REDIRECT_URI = `${window.location.origin}/settings?tab=integrations`;
  const HS_AUTH_URL = "https://app.hubspot.com/oauth/authorize";
  
  useEffect(() => {
    // Check if we have an OAuth response in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    
    if (code && state === "hubspot-oauth") {
      window.history.replaceState({}, document.title, window.location.pathname + "?tab=integrations");
      handleOAuthCallback(code);
    }

    // Check if we already have a connection
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from("hubspot_connections")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Code for "no rows returned"
          console.error("Error checking connection:", error);
        }
        return;
      }
      
      if (data) {
        setIsConnected(true);
        setConnectionDetails(data);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Get the client ID from Supabase
      const { data: secretData, error: secretError } = await supabase.functions.invoke('get-hubspot-client-id', {
        body: {}
      });
      
      if (secretError) {
        throw new Error(`Failed to get HubSpot client ID: ${secretError.message}`);
      }
      
      if (!secretData || !secretData.client_id) {
        throw new Error("HubSpot client ID not configured");
      }
      
      // Generate random state for CSRF protection
      const state = "hubspot-oauth";
      
      // Construct the OAuth URL
      const scopes = [
        "crm.objects.contacts.read",
        "crm.objects.contacts.write",
        "crm.objects.deals.read",
        "crm.objects.deals.write"
      ].join(" ");
      
      const oauthUrl = `${HS_AUTH_URL}?client_id=${secretData.client_id}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
      
      // Open HubSpot login window
      window.location.href = oauthUrl;
    } catch (error: any) {
      console.error("Error starting OAuth flow:", error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to start HubSpot connection process",
      });
      setIsConnecting(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    setIsConnecting(true);
    
    try {
      // Exchange authorization code for access token
      const { data, error } = await supabase.functions.invoke('hubspot-oauth-callback', {
        body: { 
          code,
          redirect_uri: REDIRECT_URI
        }
      });
      
      if (error) throw error;
      
      if (!data || data.error) {
        throw new Error(data?.error || "Failed to exchange code for token");
      }
      
      // Save connection details to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");
      
      await supabase.from("hubspot_connections").upsert({
        user_id: user.id,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        hub_domain: data.hub_domain,
        connected_at: new Date().toISOString()
      });
      
      setIsConnected(true);
      setConnectionDetails(data);
      setIsConnecting(false);
      
      toast({
        title: "Connected to HubSpot",
        description: "Your HubSpot account has been successfully connected",
      });
    } catch (error: any) {
      console.error("OAuth error:", error);
      setIsConnecting(false);
      
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message || "Failed to connect to HubSpot",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");
      
      // Revoke HubSpot tokens
      await supabase.functions.invoke('hubspot-revoke-token', {
        body: { 
          user_id: user.id 
        }
      });
      
      setIsConnected(false);
      setConnectionDetails(null);
      
      toast({
        title: "Disconnected from HubSpot",
        description: "Your HubSpot integration has been disconnected",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Disconnect error:", error);
      
      toast({
        variant: "destructive",
        title: "Disconnect failed",
        description: error.message || "Failed to disconnect from HubSpot",
      });
    }
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your HubSpot account is connected and syncing data
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
                  <Label htmlFor="portal-id">HubSpot Portal ID</Label>
                  <Input 
                    id="portal-id" 
                    value={connectionDetails?.portal_id || "12345678"} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-version">API Version</Label>
                  <Input id="api-version" value="v3" />
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
            Disconnect from HubSpot
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-6 border border-dashed border-slate-300 rounded-lg bg-slate-50">
        <Laptop className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Connect to HubSpot</h3>
        <p className="text-slate-500 mb-4">
          Sync your deals, contacts, and marketing data with HubSpot
        </p>
        <Button 
          onClick={handleOAuthConnect} 
          disabled={isConnecting}
          className="bg-[#FF7A59] hover:bg-[#FF5C35] text-white"
        >
          {isConnecting ? "Connecting..." : "Connect with OAuth"}
        </Button>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Integration Benefits</h3>
        <ul className="space-y-1 list-disc pl-5 text-sm text-slate-600">
          <li>Automatic deal and contact synchronization</li>
          <li>Sync marketing campaigns and lead data</li>
          <li>Map custom fields between systems</li>
          <li>Bidirectional updates</li>
        </ul>
      </div>
    </div>
  );
}
