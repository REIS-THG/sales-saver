
import { Deal, Insight } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsightsDisplay } from "./InsightsDisplay";
import { MessageGenerator } from "./MessageGenerator";

interface NextStepsTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealSelect: (dealId: string) => void;
  insights?: Insight[];
}

export function NextStepsTab({ deals, selectedDeal, onDealSelect, insights = [] }: NextStepsTabProps) {
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
