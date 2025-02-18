
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Table } from "@tanstack/react-table";
import { Deal } from "@/types/types";

interface TablePaginationProps {
  table: Table<Deal>;
  totalDeals: number;
}

export function TablePagination({ table, totalDeals }: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing {table.getRowModel().rows.length} of {totalDeals} deals
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
          </PaginationItem>
          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <PaginationItem key={i}>
              <Button
                variant={table.getState().pagination.pageIndex === i ? "default" : "ghost"}
                size="sm"
                onClick={() => table.setPageIndex(i)}
              >
                {i + 1}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
