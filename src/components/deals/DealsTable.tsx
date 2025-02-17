import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
  createColumnHelper,
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
import { type Deal } from "@/types/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DealDetailsModal from "./DealDetailsModal";
import { SortableTableRow } from "./SortableTableRow";
import { CheckCircle2, AlertCircle, Clock, Ban, ArrowUpDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const columnHelper = createColumnHelper<Deal>();

const columns = [
  columnHelper.accessor("deal_name", {
    header: ({ column }) => {
      return (
        <div>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Deal Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Input
            placeholder="Filter..."
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="h-8 w-full mt-2"
          />
        </div>
      );
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("company_name", {
    header: ({ column }) => {
      return (
        <div>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Input
            placeholder="Filter..."
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="h-8 w-full mt-2"
          />
        </div>
      );
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: ({ column }) => {
      return (
        <div>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Input
            placeholder="Filter..."
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="h-8 w-full mt-2"
          />
        </div>
      );
    },
    cell: (info) => `$${Number(info.getValue()).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => {
      return (
        <div>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Input
            placeholder="Filter..."
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="h-8 w-full mt-2"
          />
        </div>
      );
    },
    cell: (info) => {
      const status = info.getValue();
      const getStatusIcon = () => {
        switch (status) {
          case "won":
            return <CheckCircle2 className="text-green-500" />;
          case "lost":
            return <Ban className="text-red-500" />;
          case "stalled":
            return <AlertCircle className="text-yellow-500" />;
          default:
            return <Clock className="text-blue-500" />;
        }
      };
      return (
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="capitalize">{status}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("health_score", {
    header: ({ column }) => {
      return (
        <div>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Health Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
          <Input
            placeholder="Filter..."
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value)}
            className="h-8 w-full mt-2"
            type="number"
          />
        </div>
      );
    },
    cell: (info) => {
      const score = info.getValue();
      const getProgressColor = (score: number) => {
        if (score >= 70) return "bg-green-500";
        if (score >= 40) return "bg-yellow-500";
        return "bg-red-500";
      };
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            info.row.original.onHealthScoreClick?.(info.row.original.id);
          }}
          className="w-full relative group"
        >
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(score)} transition-all`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {score}%
          </span>
        </button>
      );
    },
  }),
];

interface DealsTableProps {
  initialDeals: Deal[];
}

export function DealsTable({ initialDeals }: DealsTableProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleHealthScoreClick = (dealId: string) => {
    navigate(`/deal-genius?dealId=${dealId}`);
  };

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

  const dealsWithHandler = deals.map(deal => ({
    ...deal,
    onHealthScoreClick: handleHealthScoreClick
  }));

  const table = useReactTable({
    data: dealsWithHandler,
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
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>

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
      />
    </div>
  );
}
