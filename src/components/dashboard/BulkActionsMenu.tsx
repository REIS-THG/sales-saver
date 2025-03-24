
import * as React from "react";
import { Deal } from "@/types/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilter, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface BulkActionsMenuProps {
  selectedDeals: Deal[];
  onActionComplete: () => Promise<void>;
}

export function BulkActionsMenu({ selectedDeals, onActionComplete }: BulkActionsMenuProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  if (selectedDeals.length === 0) return null;

  const handleBulkStatusUpdate = async (newStatus: Deal["status"]) => {
    if (selectedDeals.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to perform this action.",
        });
        return;
      }
      
      const dealIds = selectedDeals.map(deal => deal.id);
      
      const { error } = await supabase
        .from("deals")
        .update({ status: newStatus })
        .in("id", dealIds)
        .eq("user_id", userId);
      
      if (error) throw error;
      
      toast({
        title: "Deals updated",
        description: `Successfully updated ${dealIds.length} deals to ${newStatus}`,
      });
      
      await onActionComplete();
    } catch (error) {
      console.error("Error updating deals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update deals. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDeals.length === 0) return;
    
    setIsProcessing(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to perform this action.",
        });
        return;
      }
      
      const dealIds = selectedDeals.map(deal => deal.id);
      
      const { error } = await supabase
        .from("deals")
        .delete()
        .in("id", dealIds)
        .eq("user_id", userId);
      
      if (error) throw error;
      
      toast({
        title: "Deals deleted",
        description: `Successfully deleted ${dealIds.length} deals`,
      });
      
      await onActionComplete();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting deals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete deals. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedDeals.length} deals?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. These deals will be permanently deleted from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? <Spinner size="sm" className="mr-2" /> : null}
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {selectedDeals.length} {selectedDeals.length === 1 ? 'deal' : 'deals'} selected
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              <ListFilter className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Bulk Actions</span>
              <span className="xs:hidden">Actions</span>
              {isProcessing && <Spinner size="sm" className="ml-2" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isMobile ? "center" : "end"} className="w-56">
            <DropdownMenuItem 
              onClick={() => handleBulkStatusUpdate("won")}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Mark as Won
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleBulkStatusUpdate("lost")}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Mark as Lost
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleBulkStatusUpdate("stalled")}
              disabled={isProcessing}
            >
              <Clock className="h-4 w-4 mr-2 text-yellow-500" />
              Mark as Stalled
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleBulkStatusUpdate("open")}
              disabled={isProcessing}
            >
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              Mark as Open
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isProcessing}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Deals
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
