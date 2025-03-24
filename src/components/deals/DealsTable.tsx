
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApiError } from "@/hooks/use-api-error";
import { Deal, CustomField, User } from "@/types/types";
import { useDealsTable } from "@/hooks/use-deals-table";
import { TableContainer } from "./table/TableContainer";
import DealDetailsModal from "./DealDetailsModal";

interface DealsTableProps {
  deals: Deal[];
  customFields: CustomField[];
  showCustomFields: boolean;
  onSelectionChange: (selectedDeals: Deal[]) => void;
  fetchDeals: () => Promise<void>;
  userData?: User | null;
  onQuickNote?: (deal: Deal) => void;
}

export function DealsTable({ 
  deals, 
  customFields, 
  showCustomFields, 
  onSelectionChange,
  fetchDeals,
  userData,
  onQuickNote
}: DealsTableProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [updatingDeals, setUpdatingDeals] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const handleDealsReorder = async (newDeals: Deal[]) => {
    // This is where we would handle reordering deals if needed
    // For now, this is just a placeholder
    console.log("Deals reordered:", newDeals);
  };

  const handleDealUpdated = async () => {
    await fetchDeals();
    setSelectedDeal(null);
  };

  const handleBulkStatusUpdate = async (dealsToUpdate: Deal[], newStatus: Deal["status"]) => {
    // Implementation moved to BulkActionsMenu
  };

  const handleBulkDelete = async (dealsToDelete: Deal[]) => {
    // Implementation moved to BulkActionsMenu
  };

  const onDealDelete = async (deal: Deal) => {
    try {
      const userId = await handleAuthCheck();
      if (!userId) return;

      setUpdatingDeals(true);
      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", deal.id)
        .eq("user_id", userId);

      if (error) {
        handleError(error, "Failed to delete deal");
      } else {
        handleSuccess("Deal deleted successfully");
        await fetchDeals();
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
    } finally {
      setUpdatingDeals(false);
    }
  };

  const { table, globalFilter, setGlobalFilter } = useDealsTable(
    deals,
    customFields,
    showCustomFields,
    onDealDelete
  );

  return (
    <div>
      <TableContainer
        table={table}
        deals={deals}
        onDealClick={handleDealClick}
        onDealsReorder={handleDealsReorder}
        onRowSelection={onSelectionChange}
        isUpdating={updatingDeals}
        onQuickNote={onQuickNote}
      />

      {selectedDeal && (
        <DealDetailsModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onDealUpdated={handleDealUpdated}
          customFields={customFields}
        />
      )}
    </div>
  );
}
