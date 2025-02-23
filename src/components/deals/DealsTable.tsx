
import { useState } from "react";
import { type Deal, type CustomField } from "@/types/types";
import { TableContainer } from "./table/TableContainer";
import { TableSearch } from "./table/TableSearch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import DealDetailsModal from "./DealDetailsModal";
import { useDealsTable } from "@/hooks/use-deals-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [selectedDeals, setSelectedDeals] = useState<Deal[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deals with React Query
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
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
      return formattedDeals;
    },
    initialData: initialDeals,
  });

  // Update deal status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ dealId, newStatus }: { dealId: string; newStatus: Deal["status"] }) => {
      const { error } = await supabase
        .from("deals")
        .update({ status: newStatus })
        .eq("id", dealId);

      if (error) throw error;
      return { dealId, newStatus };
    },
    onSuccess: ({ dealId, newStatus }) => {
      queryClient.setQueryData(['deals'], (oldData: Deal[]) =>
        oldData.map(deal =>
          deal.id === dealId ? { ...deal, status: newStatus } : deal
        )
      );
      toast({
        title: "Success",
        description: "Deal status updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating deal status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update deal status. Please try again.",
      });
    },
  });

  // Delete deal mutation
  const deleteMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", dealId);

      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => {
      queryClient.setQueryData(['deals'], (oldData: Deal[]) =>
        oldData.filter(deal => deal.id !== dealId)
      );
      toast({
        title: "Success",
        description: "Deal deleted successfully.",
      });
      setDealToDelete(null);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete deal. Please try again.",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (dealsToDelete: Deal[]) => {
      const { error } = await supabase
        .from("deals")
        .delete()
        .in("id", dealsToDelete.map(deal => deal.id));

      if (error) throw error;
      return dealsToDelete.map(deal => deal.id);
    },
    onSuccess: (deletedIds) => {
      queryClient.setQueryData(['deals'], (oldData: Deal[]) =>
        oldData.filter(deal => !deletedIds.includes(deal.id))
      );
      toast({
        title: "Success",
        description: `Successfully deleted ${deletedIds.length} deals`,
      });
      setSelectedDeals([]);
      onSelectionChange?.([]);
    },
    onError: (error) => {
      console.error("Bulk delete error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete deals. Please try again.",
      });
    },
  });

  const handleBulkStatusUpdate = async (selectedDeals: Deal[], newStatus: Deal["status"]) => {
    try {
      const promises = selectedDeals.map(deal => 
        updateStatusMutation.mutateAsync({ dealId: deal.id, newStatus })
      );
      await Promise.all(promises);
      setSelectedDeals([]);
      onSelectionChange?.([]);
    } catch (error) {
      console.error("Bulk update error:", error);
    }
  };

  const { table, globalFilter, setGlobalFilter } = useDealsTable(
    deals,
    customFields,
    showCustomFields,
    (deal: Deal) => setDealToDelete(deal)
  );

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
        onDealsReorder={(newDeals) => {
          queryClient.setQueryData(['deals'], newDeals);
        }}
        onRowSelection={handleSelectionChange}
        loading={isLoading}
        isUpdating={updateStatusMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending}
        selectedDeals={selectedDeals}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkDelete={(dealsToDelete) => bulkDeleteMutation.mutate(dealsToDelete)}
      />
      
      <DealDetailsModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        customFields={customFields}
      />

      <ConfirmDialog
        title="Delete Deal"
        description={`Are you sure you want to delete the deal "${dealToDelete?.deal_name}"? This action cannot be undone and will permanently remove all associated data.`}
        onConfirm={() => dealToDelete && deleteMutation.mutate(dealToDelete.id)}
        isOpen={!!dealToDelete}
        onOpenChange={(open) => !open && setDealToDelete(null)}
      />
    </div>
  );
}
