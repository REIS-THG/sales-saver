
import { useState } from "react";
import { Card } from "@/components/ui/card";
import SalesforceIntegration from "./SalesforceIntegration";

export default function IntegrationsManager() {
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <SalesforceIntegration 
          isActive={activeIntegration === "salesforce"} 
          onActivate={() => setActiveIntegration("salesforce")}
        />
      </Card>
    </div>
  );
}
