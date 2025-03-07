
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Deal } from "@/types/types";

interface DealSelectorProps {
  deals: Deal[];
  selectedDealId: string | null;
  onDealSelect: (dealId: string) => void;
}

export function DealSelector({ deals, selectedDealId, onDealSelect }: DealSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Deal
      </label>
      <Select value={selectedDealId || ''} onValueChange={onDealSelect}>
        <SelectTrigger className="w-full md:w-96">
          <SelectValue placeholder="Choose a deal" />
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
  );
}
