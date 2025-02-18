
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

interface TableContainerProps {
  table: any;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDealsReorder: (deals: Deal[]) => void;
  loading?: boolean;
  onRowSelection?: (selectedDeals: Deal[]) => void;
  isUpdating?: boolean;
}

export function TableContainer({
  table,
  deals,
  onDealClick,
  onDealsReorder,
  loading = false,
  onRowSelection,
  isUpdating = false
}: TableContainerProps) {
  const sensors = useDragSensors();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = deals.findIndex(item => item.id === active.id);
      const newIndex = deals.findIndex(item => item.id === over?.id);
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

  if (loading || isUpdating) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <TableFilters table={table} />
        <ExportMenu deals={deals} />
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800">
        <div className="overflow-auto">
          <div className="min-w-[800px]">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader 
                  table={table}
                  onSelectAll={handleSelectAll}
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
                        onSelection={onRowSelection}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center sm:justify-end">
        <TablePagination table={table} totalDeals={deals.length} />
      </div>
    </div>
  );
}
