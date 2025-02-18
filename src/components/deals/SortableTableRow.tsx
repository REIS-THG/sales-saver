
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { type Deal } from "@/types/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { StatusSelect } from "./components/StatusSelect";
import { useDealStatus } from "@/hooks/use-deal-status";

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
  const [isSelected, setIsSelected] = useState(false);
  const {
    isUpdating,
    updateError,
    showStatusDialog,
    pendingStatus,
    setShowStatusDialog,
    handleStatusChange,
    handleStatusConfirm,
  } = useDealStatus(row.original.status);
  
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

  const handleCheckboxChange = (checked: boolean) => {
    setIsSelected(checked);
    if (onSelection) {
      onSelection(checked ? [row.original] : []);
    }
  };

  const handleRetry = () => {
    if (updateError) {
      handleStatusChange(row.original.status);
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
        <StatusSelect
          status={row.original.status}
          isUpdating={isUpdating}
          updateError={updateError}
          onStatusChange={handleStatusChange}
          onRetry={handleRetry}
        />
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
            <AlertDialogAction onClick={() => handleStatusConfirm(row.original.id)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TableRow>
  );
}
