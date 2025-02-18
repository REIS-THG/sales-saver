
import { useState } from "react";
import { type Deal } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDealStatus(initialStatus: Deal["status"]) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Deal["status"]>(initialStatus);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: Deal["status"]) => {
    setPendingStatus(newStatus);
    setShowStatusDialog(true);
  };

  const handleStatusConfirm = async (dealId: string) => {
    setIsUpdating(true);
    setUpdateError(null);

    const { error } = await supabase
      .from("deals")
      .update({ status: pendingStatus })
      .eq("id", dealId);

    if (error) {
      setUpdateError("Failed to update status");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again.",
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }
    setIsUpdating(false);
    setShowStatusDialog(false);
  };

  return {
    isUpdating,
    updateError,
    showStatusDialog,
    pendingStatus,
    setShowStatusDialog,
    handleStatusChange,
    handleStatusConfirm,
  };
}
