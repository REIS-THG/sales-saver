
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
          className="p-0 hover:bg-transparent"
        >
          Deal Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("company_name", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("amount", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
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
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
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
  }),
  columnHelper.accessor("health_score", {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
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
              className="p-0 hover:bg-transparent"
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
      }
    )
  );

  return [...baseColumns, ...customColumns];
};
