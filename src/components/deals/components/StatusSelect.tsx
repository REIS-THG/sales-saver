
import { type Deal } from "@/types/types";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusSelectProps {
  status: Deal["status"];
  isUpdating: boolean;
  updateError: string | null;
  onStatusChange: (status: Deal["status"]) => void;
  onRetry: () => void;
}

export function StatusSelect({
  status,
  isUpdating,
  updateError,
  onStatusChange,
  onRetry,
}: StatusSelectProps) {
  return (
    <div className="flex items-center gap-2">
      {updateError ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRetry}
                className="text-destructive hover:text-destructive/90"
              >
                <AlertCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to retry updating status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
      <Select
        value={status}
        onValueChange={onStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[130px]">
          {isUpdating ? (
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
  );
}
