
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Row } from "@tanstack/react-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { GripVertical, Sparkles, Loader2 } from "lucide-react";
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
import { useState } from "react";

interface SortableTableRowProps {
  row: Row<Deal>;
  onClick: () => void;
  onAnalyze: () => void;
}

export function SortableTableRow({ row, onClick, onAnalyze }: SortableTableRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
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
    transition,
    opacity: isDragging ? 0.5 : undefined,
    backgroundColor: isDragging ? "var(--muted)" : undefined,
    cursor: isDragging ? "grabbing" : "pointer",
    position: isDragging ? "relative" as const, // Fix for TypeScript error
    zIndex: isDragging ? 1 : undefined,
    boxShadow: isDragging ? "0 4px 12px rgba(0, 0, 0, 0.1)" : undefined,
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from("deals")
      .update({ status: newStatus })
      .eq("id", row.original.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again.",
      });
      console.error("Error updating status:", error);
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }
    setIsUpdating(false);
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group transition-all duration-200 ease-in-out hover:bg-gray-50 ${
        isDragging ? "animate-pulse" : ""
      }`}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            {...attributes}
            {...listeners}
            className={`cursor-grab hover:cursor-grabbing transition-colors duration-200 ${
              isDragging ? "cursor-grabbing text-primary" : "text-gray-400"
            }`}
          >
            <GripVertical className={`h-4 w-4 ${
              isDragging ? "scale-110" : "group-hover:scale-105"
            } transition-transform duration-200`} />
          </span>
          {flexRender(row.getVisibleCells()[0].column.columnDef.cell, row.getVisibleCells()[0].getContext())}
        </div>
      </TableCell>
      {row.getVisibleCells().slice(1, -2).map((cell) => (
        <TableCell key={cell.id} onClick={onClick}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
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
          onClick={onAnalyze}
          className="w-full flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Analyze
        </Button>
      </TableCell>
    </TableRow>
  );
}
