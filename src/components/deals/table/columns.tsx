
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomField, Deal } from "@/types/types";
import { ArrowUpDown, Trash2 } from "lucide-react";

export const getColumns = (
  customFields: CustomField[], 
  showCustomFields: boolean,
  onDelete: (deal: Deal) => void
): ColumnDef<Deal>[] => {
  const baseColumns: ColumnDef<Deal>[] = [
    {
      accessorKey: "deal_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deal Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "company_name",
      header: "Company",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "expected_close_date",
      header: "Expected Close",
      cell: ({ row }) => formatDate(row.original.expected_close_date),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const colors = {
          open: "bg-blue-100 text-blue-800",
          won: "bg-green-100 text-green-800",
          lost: "bg-red-100 text-red-800",
          stalled: "bg-yellow-100 text-yellow-800",
        };
        
        return (
          <Badge className={colors[status] || colors.open}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    // Action column
    {
      id: "actions",
      cell: ({ row }) => {
        const deal = row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(deal);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (showCustomFields) {
    const customColumns = customFields.map((field) => ({
      accessorKey: `custom_fields.${field.field_name}`,
      header: field.field_name,
      cell: ({ row }) => {
        const value = row.original.custom_fields?.[field.field_name];
        if (field.field_type === "boolean") {
          return value ? "Yes" : "No";
        }
        return value || "-";
      },
    }));
    return [...baseColumns.slice(0, -1), ...customColumns, baseColumns[baseColumns.length - 1]];
  }

  return baseColumns;
};
