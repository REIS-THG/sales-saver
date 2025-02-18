
import * as React from "react";
import { Deal, Insight } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { InsightsDisplay } from "./InsightsDisplay";
import { MessageGenerator } from "./MessageGenerator";

interface NextStepsTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealSelect: (dealId: string) => void;
  insights?: Insight[];
}

export function NextStepsTab({ deals, selectedDeal, onDealSelect, insights = [] }: NextStepsTabProps) {
  const [generateDripCampaign, setGenerateDripCampaign] = React.useState(false);
  const dealInsights = insights.filter(insight => insight.deal_id === selectedDeal);
  const selectedDealData = deals.find(deal => deal.id === selectedDeal);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Deal</label>
        <Select value={selectedDeal || ''} onValueChange={onDealSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a deal to view next steps" />
          </SelectTrigger>
          <SelectContent>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                {deal.deal_name} - {deal.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Generate Drip Campaign</label>
              <p className="text-sm text-muted-foreground">
                Create an automated follow-up sequence based on the analysis
              </p>
            </div>
            <Switch
              checked={generateDripCampaign}
              onCheckedChange={setGenerateDripCampaign}
            />
          </div>
        </CardContent>
      </Card>

      {selectedDealData && (
        <>
          <InsightsDisplay 
            dealName={selectedDealData.deal_name}
            insights={dealInsights}
          />
          <MessageGenerator dealId={selectedDeal} />
        </>
      )}
    </div>
  );
}
