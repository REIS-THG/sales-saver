
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { Row } from "@tanstack/react-table";
import { GripVertical, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SortableTableRowProps {
  row: Row<any>;
  onClick: () => void;
  onSelection?: (selected: boolean) => void;
  isSelected?: boolean;
  onQuickNote?: () => void;
  hasQuickNoteAction?: boolean;
}

export function SortableTableRow({
  row,
  onClick,
  onSelection,
  isSelected = false,
  onQuickNote,
  hasQuickNoteAction = false
}: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? "relative" : "static",
    backgroundColor: isDragging ? "var(--bg-muted)" : undefined,
  } as React.CSSProperties;

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelection) {
      onSelection(checked);
    }
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer 
        ${isDragging ? "bg-gray-100 dark:bg-gray-800/80" : ""}`}
      data-state={isSelected ? "selected" : undefined}
    >
      {onSelection && (
        <TableCell className="w-10 px-2 py-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
        </TableCell>
      )}
      <TableCell className="w-12 p-0">
        <div
          {...attributes}
          {...listeners}
          className="flex h-full w-full items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} onClick={onClick}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
      {hasQuickNoteAction && (
        <TableCell className="w-10 p-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuickNote) onQuickNote();
                  }}
                >
                  <MessageSquare className="h-4 w-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Add a quick note</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      )}
    </TableRow>
  );
}
