
import { TableHeader as UITableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { flexRender, Table } from "@tanstack/react-table";
import { Deal } from "@/types/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TableHeaderProps {
  table: Table<Deal>;
  onSelectAll?: (checked: boolean) => void;
  showSelection?: boolean;
}

export function TableHeader({ table, onSelectAll, showSelection }: TableHeaderProps) {
  return (
    <UITableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {showSelection && (
            <TableHead className="w-12">
              <Checkbox
                onCheckedChange={(checked) => onSelectAll?.(checked as boolean)}
                aria-label="Select all deals"
              />
            </TableHead>
          )}
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id} className="relative whitespace-nowrap">
              <div className="flex items-center gap-2">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {header.id === 'health_score' && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent 
                        className="p-2 max-w-xs bg-white dark:bg-gray-800 shadow-lg rounded-lg border"
                        sideOffset={5}
                      >
                        <p>Health score is calculated based on deal activity, status updates, and engagement levels</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      ))}
    </UITableHeader>
  );
}
