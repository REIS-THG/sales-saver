
import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type Deal, type CustomField } from "@/types/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DealDetailsModal from "./DealDetailsModal";
import { SortableTableRow } from "./SortableTableRow";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getColumns } from "./table/columns";
import { TableSearch } from "./table/TableSearch";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface DealsTableProps {
  initialDeals: Deal[];
  customFields: CustomField[];
  showCustomFields: boolean;
}

export function DealsTable({ initialDeals, customFields, showCustomFields }: DealsTableProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const navigate = useNavigate();

  const columns = getColumns(customFields, showCustomFields);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setDeals((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  useEffect(() => {
    const formattedDeals: Deal[] = initialDeals.map(deal => ({
      id: deal.id,
      deal_name: deal.deal_name,
      company_name: deal.company_name,
      amount: Number(deal.amount),
      status: (deal.status || 'open') as Deal['status'],
      health_score: deal.health_score || 50,
      user_id: deal.user_id,
      created_at: deal.created_at,
      updated_at: deal.updated_at,
      start_date: deal.start_date,
      expected_close_date: deal.expected_close_date,
      last_contacted: deal.last_contacted,
      next_action: deal.next_action,
      contact_email: deal.contact_email,
      contact_first_name: deal.contact_first_name,
      contact_last_name: deal.contact_last_name,
      company_url: deal.company_url,
      notes: typeof deal.notes === 'string' ? deal.notes : '',
      custom_fields: typeof deal.custom_fields === 'object' ? deal.custom_fields : {},
      last_note_at: deal.last_note_at,
      notes_count: deal.notes_count
    }));
    setDeals(formattedDeals);
  }, [initialDeals]);

  const table = useReactTable({
    data: deals,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TableSearch value={globalFilter} onChange={setGlobalFilter} />
        <Button 
          variant="outline" 
          onClick={() => navigate("/deal-genius")}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI Analysis
        </Button>
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
                    onClick={() => setSelectedDeal(row.original)}
                    onAnalyze={() => navigate(`/deal-genius?dealId=${row.original.id}`)}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
      
      <DealDetailsModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        customFields={customFields}
      />
    </div>
  );
}
