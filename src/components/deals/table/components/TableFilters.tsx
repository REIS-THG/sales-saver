
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
        <Button 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
          aria-label="Filter deals"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => table.getColumn('status')?.setFilterValue('open')}
          className="cursor-pointer"
        >
          Open Deals
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => table.getColumn('status')?.setFilterValue('won')}
          className="cursor-pointer"
        >
          Won Deals
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => table.getColumn('status')?.setFilterValue('lost')}
          className="cursor-pointer"
        >
          Lost Deals
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => table.getColumn('status')?.setFilterValue('stalled')}
          className="cursor-pointer"
        >
          Stalled Deals
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => table.getColumn('status')?.setFilterValue(null)}
          className="cursor-pointer text-muted-foreground"
        >
          Clear Filter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
