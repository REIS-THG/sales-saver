
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { GripVertical, Loader2, AlertCircle } from "lucide-react";
import { type Deal } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SortableTableRowProps {
  row: Row<Deal>;
  onClick: () => void;
  onSelection?: (selectedDeals: Deal[]) => void;
}

export function SortableTableRow({ 
  row, 
  onClick,
  onSelection
}: SortableTableRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Deal["status"]>(row.original.status);
  const { toast } = useToast();
  
  const {
    attributes,
    listeners,
    transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.8 : undefined,
    backgroundColor: isDragging ? "var(--muted)" : undefined,
    cursor: isDragging ? "grabbing" : "pointer",
    position: isDragging ? ("relative" as const) : undefined,
    zIndex: isDragging ? 1 : undefined,
    boxShadow: isDragging ? "0 8px 24px rgba(0, 0, 0, 0.15)" : undefined,
  };

  const handleStatusChange = async (newStatus: Deal["status"]) => {
    setPendingStatus(newStatus);
    setShowStatusDialog(true);
  };

  const handleStatusConfirm = async () => {
    setIsUpdating(true);
    setUpdateError(null);

    const { error } = await supabase
      .from("deals")
      .update({ status: pendingStatus })
      .eq("id", row.original.id);

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

  const handleRetry = () => {
    if (updateError) {
      handleStatusChange(row.original.status);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setIsSelected(checked);
    if (onSelection) {
      onSelection(checked ? [row.original] : []);
    }
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group transition-all duration-200 ease-in-out hover:bg-gray-50 
        ${isDragging ? "animate-pulse ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]" : ""}
        ${isUpdating ? "opacity-80" : ""}
        ${isSelected ? "bg-blue-50" : ""}`}
    >
      {onSelection && (
        <TableCell className="w-12">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Select ${row.original.deal_name}`}
          />
        </TableCell>
      )}
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span
                  {...attributes}
                  {...listeners}
                  className={`cursor-grab active:cursor-grabbing transition-colors duration-200 ${
                    isDragging ? "cursor-grabbing text-primary scale-110" : "text-gray-400"
                  }`}
                >
                  <GripVertical className={`h-4 w-4 ${
                    isDragging ? "scale-110" : "group-hover:scale-105"
                  } transition-transform duration-200`} />
                </span>
                {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Drag to reorder deals</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      {row.getVisibleCells().slice(1, -2).map((cell) => (
        <TableCell key={cell.id} onClick={onClick}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {updateError ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRetry}
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
            value={row.original.status}
            onValueChange={handleStatusChange}
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
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClick()}
          className="w-full flex items-center gap-2"
        >
          View Details
        </Button>
      </TableCell>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Deal Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of this deal? This action will update the deal's health score and analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TableRow>
  );
}
