import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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

interface DealsTableProps {
  initialDeals: Deal[];
  customFields: CustomField[];
  showCustomFields: boolean;
}

export function DealsTable({ initialDeals, customFields, showCustomFields }: DealsTableProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
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

  const handleDealUpdated = async () => {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) return;

    const { data: dealsData } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (dealsData) {
      setDeals(dealsData as Deal[]);
    }
  };

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

  useEffect(() => {
    setDeals(initialDeals.map(deal => ({
      ...deal,
      name: deal.deal_name, // Map deal_name to name for compatibility
      value: deal.amount, // Map amount to value for compatibility
      custom_fields: deal.custom_fields as Record<string, any> || {},
    })));
  }, [initialDeals]);

  useEffect(() => {
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deals'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDeals((currentDeals) => [...currentDeals, payload.new as Deal]);
          } else if (payload.eventType === 'DELETE') {
            setDeals((currentDeals) => 
              currentDeals.filter((deal) => deal.id !== payload.old.id)
            );
          } else if (payload.eventType === 'UPDATE') {
            setDeals((currentDeals) =>
              currentDeals.map((deal) =>
                deal.id === payload.new.id ? { ...deal, ...payload.new } : deal
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <TableSearch value={globalFilter} onChange={setGlobalFilter} />

      <div className="rounded-md border">
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
                    onDealUpdated={handleDealUpdated}
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
        onDealUpdated={handleDealUpdated}
        customFields={customFields}
      />
    </div>
  );
}
