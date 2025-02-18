
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { type Deal } from "@/types/types";
import { SortableTableRow } from "@/components/deals/SortableTableRow";
import { useDragSensors } from "@/hooks/use-drag-sensors";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
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
  );
}
