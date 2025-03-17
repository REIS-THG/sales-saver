
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

interface SalesforceIntegrationProps {
  isActive: boolean;
  onActivate: () => void;
}

interface SalesforceFormValues {
  clientId: string;
  clientSecret: string;
  instanceUrl: string;
  syncDeals: boolean;
  syncContacts: boolean;
  syncInterval: "realtime" | "hourly" | "daily";
}

export default function SalesforceIntegration({ isActive, onActivate }: SalesforceIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const form = useForm<SalesforceFormValues>({
    defaultValues: {
      clientId: "",
      clientSecret: "",
      instanceUrl: "",
      syncDeals: true,
      syncContacts: false,
      syncInterval: "realtime"
    }
  });

  const handleConnect = () => {
    // Simulate OAuth flow - in a real app, this would redirect to Salesforce OAuth
    if (!isConnected) {
      // Here you would redirect to Salesforce login
      console.log("Connecting to Salesforce...");
      
      // Simulating successful connection
      setTimeout(() => {
        setIsConnected(true);
        onActivate();
      }, 1000);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleFormSubmit = (values: SalesforceFormValues) => {
    console.log("Salesforce integration settings:", values);
    // Save configuration to backend
    setIsConfiguring(false);
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
            </p>
            <Button onClick={handleConnect}>Connect Salesforce</Button>
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
                      <h3 className="text-lg font-medium">Connection Settings</h3>
                      
                      <FormField
                        control={form.control}
                        name="instanceUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instance URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourcompany.my.salesforce.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your Salesforce instance URL
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your Salesforce Client ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Secret</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"  
                                placeholder="Enter your Salesforce Client Secret" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />
                    
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
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsConfiguring(false)}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
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
