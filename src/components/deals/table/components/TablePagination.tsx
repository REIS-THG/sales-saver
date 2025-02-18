
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Table } from "@tanstack/react-table";
import { Deal } from "@/types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  table: Table<Deal>;
  totalDeals: number;
}

export function TablePagination({ table, totalDeals }: TablePaginationProps) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing {table.getRowModel().rows.length} of {totalDeals} deals
      </div>
      <Pagination className="order-1 sm:order-2">
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          <PaginationItem className="flex items-center">
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
