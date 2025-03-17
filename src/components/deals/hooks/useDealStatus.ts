
import { useState } from "react";
import { Deal } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDealStatus = (deal: Deal | null, onDealUpdated?: () => void) => {
  const [status, setStatus] = useState<Deal["status"]>(deal?.status || "open");
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    if (!deal) return;

    setIsStatusUpdating(true);
    const { error } = await supabase
      .from("deals")
      .update({ status: newStatus })
      .eq("id", deal.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again.",
      });
      console.error("Error updating status:", error);
    } else {
      setStatus(newStatus as Deal["status"]);
      if (onDealUpdated) onDealUpdated();
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }
    setIsStatusUpdating(false);
  };

  return {
    status,
    setStatus,
    isStatusUpdating,
    handleStatusChange
  };
};
