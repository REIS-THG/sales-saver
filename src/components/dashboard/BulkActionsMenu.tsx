
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, CheckCircle, Clock, XCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Deal } from "@/types/types";

interface BulkActionsMenuProps {
  selectedDeals: Deal[];
  onDeleteDeals: (dealId: string) => Promise<void>;
  onChangeStatus: (dealId: string, status: Deal['status']) => Promise<void>;
  onClearSelection: () => void;
}

export function BulkActionsMenu({
  selectedDeals,
  onDeleteDeals,
  onChangeStatus,
  onClearSelection,
}: BulkActionsMenuProps) {
  const handleDelete = async () => {
    if (confirm(`Delete ${selectedDeals.length} selected deals?`)) {
      for (const deal of selectedDeals) {
        await onDeleteDeals(deal.id);
      }
      onClearSelection();
    }
  };

  const handleStatusChange = async (status: Deal['status']) => {
    for (const deal of selectedDeals) {
      await onChangeStatus(deal.id, status);
    }
    onClearSelection();
  };

  return (
    <div className="mb-4 bg-white border rounded-lg shadow-sm p-2 flex items-center justify-between">
      <div>
        <span className="text-sm text-gray-600 mr-2">
          {selectedDeals.length} deals selected
        </span>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Set Status <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange("open")}>
              <Clock className="mr-2 h-4 w-4" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("won")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Won
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("lost")}>
              <XCircle className="mr-2 h-4 w-4" />
              Lost
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("stalled")}>
              <Archive className="mr-2 h-4 w-4" />
              Stalled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
