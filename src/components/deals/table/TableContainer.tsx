
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { type Deal } from "@/types/types";
import { SortableTableRow } from "@/components/deals/SortableTableRow";
import { useDragSensors } from "@/hooks/use-drag-sensors";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';

interface TableContainerProps {
  table: any;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDealsReorder: (deals: Deal[]) => void;
  loading?: boolean;
  onRowSelection?: (selectedDeals: Deal[]) => void;
}

export function TableContainer({ 
  table, 
  deals, 
  onDealClick, 
  onDealsReorder,
  loading = false,
  onRowSelection
}: TableContainerProps) {
  const sensors = useDragSensors();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = deals.findIndex((item) => item.id === active.id);
      const newIndex = deals.findIndex((item) => item.id === over?.id);
      const newDeals = arrayMove(deals, oldIndex, newIndex);
      onDealsReorder(newDeals);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onRowSelection?.(deals);
    } else {
      onRowSelection?.([]);
    }
  };

  const exportToExcel = () => {
    const exportData = deals.map(deal => ({
      'Deal Name': deal.deal_name,
      'Company': deal.company_name,
      'Amount': deal.amount,
      'Status': deal.status,
      'Health Score': deal.health_score,
      'Expected Close Date': deal.expected_close_date,
      'Contact Name': `${deal.contact_first_name || ''} ${deal.contact_last_name || ''}`.trim(),
      'Contact Email': deal.contact_email,
      'Company URL': deal.company_url,
      'Notes': deal.notes,
      'Created At': deal.created_at,
      'Last Updated': deal.updated_at
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deals");
    
    // Generate & save file
    XLSX.writeFile(wb, `deals_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = deals.map(deal => ({
      'Deal Name': deal.deal_name,
      'Company': deal.company_name,
      'Amount': deal.amount,
      'Status': deal.status,
      'Health Score': deal.health_score,
      'Expected Close Date': deal.expected_close_date,
      'Contact Name': `${deal.contact_first_name || ''} ${deal.contact_last_name || ''}`.trim(),
      'Contact Email': deal.contact_email,
      'Company URL': deal.company_url,
      'Notes': deal.notes,
      'Created At': deal.created_at,
      'Last Updated': deal.updated_at
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `deals_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 gap-2">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportToExcel}>
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV}>
              Export to CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border overflow-auto max-h-[calc(100vh-280px)]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {onRowSelection && (
                    <TableHead className="w-12">
                      <Checkbox
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
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
            </TableHeader>
            <TableBody>
              <SortableContext
                items={deals.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows.map((row) => (
                  <SortableTableRow
                    key={row.original.id}
                    row={row}
                    onClick={() => onDealClick(row.original)}
                    onSelection={onRowSelection}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {deals.length} deals
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => table.previousPage()} 
                disabled={!table.getCanPreviousPage()}
              />
            </PaginationItem>
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => table.setPageIndex(i)}
                  isActive={table.getState().pagination.pageIndex === i}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => table.nextPage()} 
                disabled={!table.getCanNextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
