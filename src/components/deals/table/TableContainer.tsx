
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Table, TableBody } from "@/components/ui/table";
import { type Deal } from "@/types/types";
import { SortableTableRow } from "@/components/deals/SortableTableRow";
import { useDragSensors } from "@/hooks/use-drag-sensors";
import { Spinner } from "@/components/ui/spinner";
import { TableFilters } from "./components/TableFilters";
import { ExportMenu } from "./components/ExportMenu";
import { TablePagination } from "./components/TablePagination";
import { TableHeader } from "./components/TableHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export interface TableContainerProps {
  table: any;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDealsReorder: (deals: Deal[]) => void;
  loading?: boolean;
  onRowSelection?: (selectedDeals: Deal[]) => void;
  isUpdating?: boolean;
  selectedDeals?: Deal[];
  onBulkStatusUpdate?: (selectedDeals: Deal[], newStatus: Deal["status"]) => Promise<void>;
  onBulkDelete?: (dealsToDelete: Deal[]) => Promise<void>;
}

export function TableContainer({
  table,
  deals,
  onDealClick,
  onDealsReorder,
  loading = false,
  onRowSelection,
  isUpdating = false,
  selectedDeals = [],
  onBulkStatusUpdate,
  onBulkDelete
}: TableContainerProps) {
  const sensors = useDragSensors();
  const isMobile = useIsMobile();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = deals.findIndex(item => item.id === active.id);
      const newIndex = deals.findIndex(item => item.id === over?.id);
      onDealsReorder(arrayMove(deals, oldIndex, newIndex));
    }
  };

  const handleRowSelection = (dealId: string, selected: boolean) => {
    if (onRowSelection) {
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        const updatedSelection = selected
          ? [...selectedDeals, deal]
          : selectedDeals.filter(d => d.id !== dealId);
        onRowSelection(updatedSelection);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center animate-pulse">
          <div className="w-32 h-8 bg-gray-200 rounded" />
          <div className="w-24 h-8 bg-gray-200 rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-full h-14" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        {isMobile ? (
          <div className="w-full flex justify-between items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="mb-2 w-full sm:w-auto">
                  Filters
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <div className="p-2">
                  <TableFilters table={table} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <ExportMenu deals={deals} />
          </div>
        ) : (
          <>
            <TableFilters table={table} />
            <ExportMenu deals={deals} />
          </>
        )}
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800 relative">
        {isUpdating && (
          <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/20 flex items-center justify-center z-10">
            <Spinner size="lg" />
          </div>
        )}
        <div className="overflow-auto">
          <div className="min-w-[650px]">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader 
                  table={table}
                  onSelectAll={(selected) => {
                    if (onRowSelection) {
                      onRowSelection(selected ? deals : []);
                    }
                  }}
                  showSelection={!!onRowSelection}
                />
                <TableBody>
                  <SortableContext
                    items={deals.map(d => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map(row => (
                      <SortableTableRow
                        key={row.original.id}
                        row={row}
                        onClick={() => onDealClick(row.original)}
                        onSelection={(selected) => handleRowSelection(row.original.id, selected)}
                        isSelected={selectedDeals.some(d => d.id === row.original.id)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </div>
      </div>

      <div className="flex justify-center sm:justify-end">
        <TablePagination table={table} totalDeals={deals.length} />
      </div>
    </div>
  );
}
