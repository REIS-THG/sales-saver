
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle2, AlertCircle, Clock, Ban } from "lucide-react";
import { type Deal, type CustomField } from "@/types/types";

const columnHelper = createColumnHelper<Deal>();

const baseColumns = [
  columnHelper.accessor("deal_name", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent whitespace-nowrap"
        >
          Deal Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => info.getValue(),
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId);
      const b = rowB.getValue(columnId);
      return String(a).localeCompare(String(b));
    }
  }),
  columnHelper.accessor("company_name", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent whitespace-nowrap"
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => info.getValue(),
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId);
      const b = rowB.getValue(columnId);
      return String(a).localeCompare(String(b));
    }
  }),
  columnHelper.accessor("amount", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent whitespace-nowrap"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => `$${Number(info.getValue()).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId));
      const b = Number(rowB.getValue(columnId));
      return a - b;
    }
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent whitespace-nowrap"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
    sortingFn: (rowA, rowB, columnId) => {
      const a = rowA.getValue(columnId);
      const b = rowB.getValue(columnId);
      return String(a).localeCompare(String(b));
    }
  }),
  columnHelper.accessor("health_score", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent whitespace-nowrap"
        >
          Health Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(score)} transition-all`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-sm font-medium min-w-[3rem] text-right">
            {score}%
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB, columnId) => {
      const a = Number(rowA.getValue(columnId));
      const b = Number(rowB.getValue(columnId));
      return a - b;
    }
  }),
];

export const getColumns = (customFields: CustomField[], showCustomFields: boolean) => {
  if (!showCustomFields) return baseColumns;

  const customColumns = customFields.map((field) => 
    columnHelper.accessor(
      row => row.custom_fields?.[field.field_name] as string | number | boolean,
      {
        id: field.field_name,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="p-0 hover:bg-transparent whitespace-nowrap"
            >
              {field.field_name}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: (info) => {
          const value = info.getValue();
          if (typeof value === "boolean") {
            return value ? "Yes" : "No";
          }
          return value?.toString() || "-";
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId);
          const b = rowB.getValue(columnId);
          
          if (typeof a === "boolean" && typeof b === "boolean") {
            return a === b ? 0 : a ? 1 : -1;
          }
          
          if (typeof a === "number" && typeof b === "number") {
            return a - b;
          }
          
          if (a == null) return 1;
          if (b == null) return -1;
          
          return String(a).localeCompare(String(b));
        }
      }
    )
  );

  return [...baseColumns, ...customColumns];
};
