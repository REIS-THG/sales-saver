
import { useState, useEffect } from "react";
import { type Deal, type CustomField } from "@/types/types";
import { TableContainer } from "./table/TableContainer";
import { TableSearch } from "./table/TableSearch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import DealDetailsModal from "./DealDetailsModal";
import { useDealsTable } from "@/hooks/use-deals-table";

interface DealsTableProps {
  initialDeals: Deal[];
  customFields: CustomField[];
  showCustomFields: boolean;
  onSelectionChange?: (selectedDeals: Deal[]) => void;
}

export function DealsTable({ 
  initialDeals, 
  customFields, 
  showCustomFields,
  onSelectionChange 
}: DealsTableProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState<Deal[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateDealStatus = async (dealId: string, newStatus: Deal["status"]) => {
    try {
      const { error } = await supabase
        .from("deals")
        .update({ status: newStatus })
        .eq("id", dealId);

      if (error) {
        throw error;
      }

      // Update local state
      setDeals(currentDeals => 
        currentDeals.map(deal => 
          deal.id === dealId ? { ...deal, status: newStatus } : deal
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating deal status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update deal status. Please try again.",
      });
      return false;
    }
  };

  const handleBulkStatusUpdate = async (selectedDeals: Deal[], newStatus: Deal["status"]) => {
    setIsUpdating(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const results = await Promise.allSettled(
        selectedDeals.map(deal => updateDealStatus(deal.id, newStatus))
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          successCount++;
        } else {
          failCount++;
        }
      });

      if (successCount > 0) {
        toast({
          title: "Success",
          description: `Updated ${successCount} deals to ${newStatus}${failCount > 0 ? `. Failed: ${failCount}` : ''}`,
        });
      }

      // Clear selection after update
      setSelectedDeals([]);
      onSelectionChange?.([]);
    } catch (error) {
      console.error("Bulk update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update some deals. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!dealToDelete) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", dealToDelete.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Deal deleted successfully.",
      });
      setDeals(deals.filter(deal => deal.id !== dealToDelete.id));
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete deal. Please try again.",
      });
    } finally {
      setDealToDelete(null);
      setIsUpdating(false);
    }
  };

  const handleBulkDelete = async (dealsToDelete: Deal[]) => {
    setIsUpdating(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const { error } = await supabase
        .from("deals")
        .delete()
        .in("id", dealsToDelete.map(deal => deal.id));

      if (error) {
        throw error;
      }

      setDeals(currentDeals => 
        currentDeals.filter(deal => !dealsToDelete.find(d => d.id === deal.id))
      );

      toast({
        title: "Success",
        description: `Successfully deleted ${dealsToDelete.length} deals`,
      });

      // Clear selection
      setSelectedDeals([]);
      onSelectionChange?.([]);
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete deals. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const { table, globalFilter, setGlobalFilter } = useDealsTable(
    deals,
    customFields,
    showCustomFields,
    (deal: Deal) => setDealToDelete(deal)
  );

  useEffect(() => {
    const formattedDeals: Deal[] = initialDeals.map(deal => ({
      id: deal.id,
      deal_name: deal.deal_name,
      company_name: deal.company_name,
      amount: Number(deal.amount),
      status: (deal.status || 'open') as Deal['status'],
      health_score: deal.health_score || 50,
      user_id: deal.user_id,
      created_at: deal.created_at,
      updated_at: deal.updated_at,
      start_date: deal.start_date,
      expected_close_date: deal.expected_close_date,
      last_contacted: deal.last_contacted,
      next_action: deal.next_action,
      contact_email: deal.contact_email,
      contact_first_name: deal.contact_first_name,
      contact_last_name: deal.contact_last_name,
      company_url: deal.company_url,
      notes: typeof deal.notes === 'string' ? deal.notes : '',
      custom_fields: typeof deal.custom_fields === 'object' ? deal.custom_fields : {},
      last_note_at: deal.last_note_at,
      notes_count: deal.notes_count
    }));
    setDeals(formattedDeals);
  }, [initialDeals]);

  const handleSelectionChange = (selectedDeals: Deal[]) => {
    setSelectedDeals(selectedDeals);
    onSelectionChange?.(selectedDeals);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TableSearch value={globalFilter} onChange={setGlobalFilter} />
      </div>

      <TableContainer
        table={table}
        deals={deals}
        onDealClick={(deal) => setSelectedDeal(deal)}
        onDealsReorder={setDeals}
        onRowSelection={handleSelectionChange}
        isUpdating={isUpdating}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkDelete={handleBulkDelete}
        selectedDeals={selectedDeals}
      />
      
      <DealDetailsModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        customFields={customFields}
      />

      <ConfirmDialog
        title="Delete Deal"
        description={`Are you sure you want to delete the deal "${dealToDelete?.deal_name}"? This action cannot be undone and will permanently remove all associated data.`}
        onConfirm={handleDeleteConfirm}
        isOpen={!!dealToDelete}
        onOpenChange={(open) => !open && setDealToDelete(null)}
      />
    </div>
  );
}
