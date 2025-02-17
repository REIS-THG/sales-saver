
import { Deal } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface NextStepsTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealSelect: (dealId: string) => void;
}

export function NextStepsTab({ deals, selectedDeal, onDealSelect }: NextStepsTabProps) {
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
        <CardContent className="p-6">
          {selectedDeal ? (
            <p className="text-gray-500">Select a deal to view AI-suggested next steps</p>
          ) : (
            <p className="text-gray-500">Please select a deal first</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
