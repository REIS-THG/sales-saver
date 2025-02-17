
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
  } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      className="cursor-pointer hover:bg-gray-50"
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
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
