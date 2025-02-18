
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table } from "@tanstack/react-table";
import { Deal } from "@/types/types";

interface TableFiltersProps {
  table: Table<Deal>;
}

export function TableFilters({ table }: TableFiltersProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => table.getColumn('status')?.setFilterValue('open')}>
          Open Deals
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => table.getColumn('status')?.setFilterValue('won')}>
          Won Deals
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => table.getColumn('status')?.setFilterValue('lost')}>
          Lost Deals
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => table.getColumn('status')?.setFilterValue('stalled')}>
          Stalled Deals
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => table.getColumn('status')?.setFilterValue(null)}>
          Clear Filter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
