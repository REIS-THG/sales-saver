
import { Deal } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DealSelectorProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealChange: (dealId: string) => void;
}

export const DealSelector = ({ deals, selectedDeal, onDealChange }: DealSelectorProps) => {
  return (
    <Select value={selectedDeal || ''} onValueChange={onDealChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a deal to analyze" />
      </SelectTrigger>
      <SelectContent>
        {deals.map((deal) => (
          <SelectItem key={deal.id} value={deal.id}>
            {deal.deal_name} - {deal.company_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
