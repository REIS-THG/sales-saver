
import { Deal } from "@/types/types";
import { DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface DealModalHeaderProps {
  deal: Deal;
  status: Deal["status"];
  isStatusUpdating: boolean;
  onStatusChange: (status: string) => void;
}

export const DealModalHeader = ({ 
  deal, 
  status, 
  isStatusUpdating, 
  onStatusChange 
}: DealModalHeaderProps) => {
  return (
    <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-4">
      <span className="text-xl font-semibold break-all">{deal.deal_name}</span>
      <div className="flex items-center gap-4 sm:ml-auto">
        <div className="text-sm whitespace-nowrap">
          Health Score: 
          <span className={`ml-2 px-2 py-1 rounded ${
            deal.health_score >= 70 ? 'bg-green-100 text-green-800' :
            deal.health_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {deal.health_score}%
          </span>
        </div>
        <Select value={status} onValueChange={onStatusChange} disabled={isStatusUpdating}>
          <SelectTrigger className="w-[120px]">
            {isStatusUpdating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="stalled">Stalled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DialogTitle>
  );
};
