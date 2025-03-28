
import { BulkActionsMenu } from "@/components/dashboard/BulkActionsMenu";
import type { Deal } from "@/types/types";

interface DashboardActionsProps {
  selectedDeals: Deal[];
  onDeleteDeals: (dealIds: string[]) => Promise<void>;
  onChangeStatus: (dealId: string, newStatus: Deal['status']) => Promise<void>;
  onClearSelection: () => void;
}

export function DashboardActions({
  selectedDeals,
  onDeleteDeals,
  onChangeStatus,
  onClearSelection
}: DashboardActionsProps) {
  if (selectedDeals.length === 0) {
    return null;
  }

  return (
    <BulkActionsMenu
      selectedDeals={selectedDeals}
      onDeleteDeals={onDeleteDeals}
      onChangeStatus={onChangeStatus}
      onClearSelection={onClearSelection}
    />
  );
}
