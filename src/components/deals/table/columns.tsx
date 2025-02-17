
import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CheckCircle2, AlertCircle, Clock, Ban } from "lucide-react";
import { type Deal } from "@/types/types";

const columnHelper = createColumnHelper<Deal>();

export const columns = [
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
