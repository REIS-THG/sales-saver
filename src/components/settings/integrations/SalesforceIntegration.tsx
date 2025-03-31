
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SalesforceIntegrationProps {
  isActive: boolean;
  onActivate: () => void;
}

interface SalesforceFormValues {
  syncDeals: boolean;
  syncContacts: boolean;
  syncInterval: "realtime" | "hourly" | "daily";
}

export default function SalesforceIntegration({ isActive, onActivate }: SalesforceIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [oauthWindow, setOauthWindow] = useState<Window | null>(null);
  const { toast } = useToast();

  const form = useForm<SalesforceFormValues>({
    defaultValues: {
      syncDeals: true,
      syncContacts: false,
      syncInterval: "realtime"
    }
  });

  const handleConnect = () => {
    // Simulate OAuth flow with Salesforce
    if (!isConnected) {
      setIsAuthenticating(true);
      
      // Open OAuth popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // In a real implementation, this would point to a Salesforce OAuth endpoint
      const oauthUrl = 'https://login.salesforce.com/services/oauth2/authorize' + 
        '?response_type=code' + 
        '&client_id=DEMO_CLIENT_ID' + // This would be your actual Salesforce client ID
        '&redirect_uri=' + encodeURIComponent(window.location.origin + '/oauth/callback') +
        '&state=salesforce';
      
      const popup = window.open(
        oauthUrl,
        'salesforce_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      setOauthWindow(popup);
      
      // Handle messaging from the popup
      const handleMessage = (event: MessageEvent) => {
        // In a real implementation, verify the origin
        if (event.data.type === 'salesforce_oauth_success') {
          // Successfully authenticated
          setIsConnected(true);
          onActivate();
          setIsAuthenticating(false);
          popup?.close();
          
          toast({
            title: "Connected to Salesforce",
            description: "Your Salesforce account has been successfully connected.",
          });
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // For demo purposes, simulate a successful OAuth flow after 2 seconds
      setTimeout(() => {
        setIsConnected(true);
        onActivate();
        setIsAuthenticating(false);
        popup?.close();
        
        toast({
          title: "Connected to Salesforce",
          description: "Your Salesforce account has been successfully connected.",
        });
        
        window.removeEventListener('message', handleMessage);
      }, 2000);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Disconnected from Salesforce",
      description: "Your Salesforce integration has been disabled.",
    });
  };

  const handleFormSubmit = (values: SalesforceFormValues) => {
    console.log("Salesforce integration settings:", values);
    // Save configuration to backend
    setIsConfiguring(false);
    
    toast({
      title: "Settings saved",
      description: "Your Salesforce integration settings have been updated.",
    });
  };

  return (
    <div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Salesforce</CardTitle>
          <CardDescription>
            Connect your Salesforce account to sync deals and contacts
          </CardDescription>
        </div>
        <img 
          src="https://www.salesforce.com/news/wp-content/uploads/sites/3/2021/05/Salesforce-logo.jpg" 
          alt="Salesforce logo" 
          className="h-10 w-auto object-contain" 
        />
      </CardHeader>
      
      <CardContent>
        {!isConnected ? (
          <div className="flex flex-col space-y-4">
            <p className="text-sm">
              Connect your Salesforce account to automatically sync deals, contacts and other data between platforms.
              We use OAuth to securely connect to your Salesforce instance without storing your credentials.
            </p>
            <Button onClick={handleConnect} disabled={isAuthenticating}>
              {isAuthenticating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Salesforce"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connected to Salesforce</p>
                <p className="text-sm text-muted-foreground">Last synced: Just now</p>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfiguring(!isConfiguring)}
                >
                  Configure
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </div>

            {isConfiguring && (
              <div className="pt-4">
                <Separator className="mb-6" />
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit(handleFormSubmit)} 
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Sync Settings</h3>
                      
                      <FormField
                        control={form.control}
                        name="syncDeals"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Sync Deals</FormLabel>
                              <FormDescription>
                                Keep deals in sync between Salesforce and this platform in real-time
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="syncContacts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Sync Contacts</FormLabel>
                              <FormDescription>
                                Keep contacts in sync between Salesforce and this platform
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="syncInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sync Frequency</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select sync frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="realtime">Real-time</SelectItem>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How often to synchronize data between platforms
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsConfiguring(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Settings</Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
}
