
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesforceIntegration } from "./SalesforceIntegration";
import { HubSpotIntegration } from "./HubSpotIntegration";
import { ZapierIntegration } from "./ZapierIntegration";

export function IntegrationsManager() {
  const [activeTab, setActiveTab] = useState("salesforce");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Connect your CRM account to sync deals and contacts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
            <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
            <TabsTrigger value="zapier">Zapier</TabsTrigger>
          </TabsList>
          <TabsContent value="salesforce">
            <SalesforceIntegration />
          </TabsContent>
          <TabsContent value="hubspot">
            <HubSpotIntegration />
          </TabsContent>
          <TabsContent value="zapier">
            <ZapierIntegration />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default IntegrationsManager;
