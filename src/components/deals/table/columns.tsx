
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomField, Deal } from "@/types/types";
import { ArrowUpDown, Trash2, Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      accessorKey: "health_score",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Deal Health
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const score = row.original.health_score;
        let color;
        let healthStatus;
        
        if (score >= 70) {
          color = "bg-green-100 text-green-800";
          healthStatus = "Healthy - This deal is progressing well";
        } else if (score >= 40) {
          color = "bg-yellow-100 text-yellow-800";
          healthStatus = "Moderate - Needs attention";
        } else {
          color = "bg-red-100 text-red-800";
          healthStatus = "At Risk - Immediate attention required";
        }
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <Badge className={color}>
                    {score}%
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <div className="space-y-3 p-1">
                  <p className="font-medium">{healthStatus}</p>
                  <div className="text-sm space-y-2">
                    <p className="font-semibold">Score Factors:</p>
                    <ul className="space-y-1 list-disc ml-4">
                      <li>Risks: competitor (-15), budget (-12), delays (-10)</li>
                      <li>Opportunities: immediate needs (+15), expansion (+12)</li>
                      <li>Actions: completed (+5), pending (-3)</li>
                      <li>Engagement: recent activity (up to +10)</li>
                      <li>Timeline: past due (-15), near deadline (-5)</li>
                      <li>Status: won (+25), stalled (-15), lost (-40)</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      All factors are weighted by AI confidence scores and updated automatically with new insights.
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
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
