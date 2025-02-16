
import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
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
import { CheckCircle2, AlertCircle, Clock, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const columnHelper = createColumnHelper<Deal>();

const columns = [
  columnHelper.accessor("deal_name", {
    header: "Deal Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("company_name", {
    header: "Company",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => `$${Number(info.getValue()).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
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
    header: "Health Score",
    cell: (info) => {
      const score = info.getValue();
      const getHealthScoreColor = (score: number) => {
        if (score >= 70) return "bg-green-100 text-green-800";
        if (score >= 40) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
      };
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthScoreColor(
            score
          )}`}
        >
          {score}%
        </span>
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
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const table = useReactTable({
    data: deals,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDeals((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
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
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
      
      <DealDetailsModal
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />
    </div>
  );
}
