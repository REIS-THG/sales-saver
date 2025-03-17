import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Deal, CustomField } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useApiError } from "@/hooks/use-api-error";

// Status configuration with colors
const statusConfig = {
  won: { label: "Won", color: "bg-green-500 text-white" },
  lost: { label: "Lost", color: "bg-red-500 text-white" },
  pending: { label: "Pending", color: "bg-yellow-500 text-white" },
  stalled: { label: "Stalled", color: "bg-gray-500 text-white" },
  negotiating: { label: "Negotiating", color: "bg-blue-500 text-white" },
};

interface DealsTableProps {
  deals: Deal[];
  customFields: CustomField[];
  showCustomFields: boolean;
  onSelectionChange: (selectedDeals: Deal[]) => void;
  fetchDeals: () => Promise<void>;
  userData?: { preferred_currency?: string } | null;
}

export function DealsTable({ 
  deals, 
  customFields, 
  showCustomFields, 
  onSelectionChange,
  fetchDeals,
  userData 
}: DealsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();

  const currency = userData?.preferred_currency || 'USD';

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const handleStatusChange = async (dealId: string, newStatus: string) => {
    try {
      const userId = await handleAuthCheck();
      if (!userId) return;

      const { error } = await supabase
        .from("deals")
        .update({ status: newStatus })
        .eq("id", dealId)
        .eq("user_id", userId);

      if (error) {
        handleError(error, "Failed to update status");
      } else {
        handleSuccess("Status updated successfully");
        await fetchDeals();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Generate columns based on standard and custom fields
  const generateColumns = (): ColumnDef<Deal>[] => {
    const standardColumns: ColumnDef<Deal>[] = [
      {
        accessorKey: "deal_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deal Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "company_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatAmount(row.original.amount),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`${config.color} px-2 py-1 rounded-full text-sm font-medium w-28`}
                >
                  {config.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(statusConfig).map(([value, { label, color }]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handleStatusChange(row.original.id, value)}
                    className={`${color} my-1 rounded`}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "health_score",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Health
            <Activity className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const score = row.original.health_score || 0;
          return (
            <div className={`font-medium ${getHealthScoreColor(score)}`}>
              {score}%
            </div>
          );
        },
      },
      {
        accessorKey: "expected_close_date",
        header: "Expected Close Date",
        cell: ({ row }) => {
          const date = row.original.expected_close_date;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const deal = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(`/deals/${deal.id}`)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/ai-analysis?dealId=${deal.id}`)}>
                  Analyze with AI
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        the deal from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          const userId = await handleAuthCheck();
                          if (!userId) return;

                          const { error } = await supabase
                            .from("deals")
                            .delete()
                            .eq("id", deal.id)
                            .eq("user_id", userId);

                          if (error) {
                            handleError(error, "Failed to delete deal");
                          } else {
                            handleSuccess("Deal deleted successfully");
                            await fetchDeals();
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];

    if (showCustomFields) {
      customFields.forEach((field) => {
        standardColumns.push({
          accessorFn: (row) => row.custom_fields?.[field.field_name],
          header: field.field_name,
        });
      });
    }

    return standardColumns;
  };

  const columns = generateColumns();

  const table = useReactTable({
    data: deals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  // Update selected deals when row selection changes
  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedDeals = selectedRows.map(row => row.original);
    onSelectionChange(selectedDeals);
  }, [rowSelection, table]);

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter deals..."
          value={(table.getColumn("deal_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("deal_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Rows per page:</span>
          <select
            value={pageSize}
            onChange={e => {
              const newSize = parseInt(e.target.value);
              setPageSize(newSize);
              table.setPageSize(newSize);
            }}
            className="border rounded p-1"
          >
            {[5, 10, 20, 30, 40, 50].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
