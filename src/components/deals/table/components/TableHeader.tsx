
import { TableHeader as UITableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { flexRender, Table } from "@tanstack/react-table";
import { Deal } from "@/types/types";

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
            <TableHead key={header.id}>
              {flexRender(
                header.column.columnDef.header,
                header.getContext()
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </UITableHeader>
  );
}
