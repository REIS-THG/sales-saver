
import { PieChart, BarChart, LineChart, Table } from "lucide-react";
import type { ReportConfiguration } from "@/components/reports/types";

// Predefined report templates for common use cases
export const reportTemplates: ReportConfiguration[] = [
  {
    id: "template-sales-by-status",
    user_id: "template", // Added user_id property
    name: "Sales by Status",
    description: "Visualize your pipeline distribution by deal status",
    config: {
      dimensions: [{ field: "status", type: "standard", label: "Status" }],
      metrics: [{ field: "amount", aggregation: "sum", label: "Total Value" }],
      filters: [],
      visualization: "pie"
    },
    created_at: new Date().toISOString(),
    is_favorite: false,
  },
  {
    id: "template-monthly-sales",
    user_id: "template", // Added user_id property
    name: "Monthly Sales Trend",
    description: "Track your sales performance over time",
    config: {
      dimensions: [{ field: "created_at", type: "standard", label: "Month" }],
      metrics: [{ field: "amount", aggregation: "sum", label: "Monthly Sales" }],
      filters: [],
      visualization: "line"
    },
    created_at: new Date().toISOString(),
    is_favorite: false,
  },
  {
    id: "template-top-deals",
    user_id: "template", // Added user_id property
    name: "Top 10 Deals",
    description: "View your highest value opportunities",
    config: {
      dimensions: [{ field: "deal_name", type: "standard", label: "Deal" }],
      metrics: [{ field: "amount", aggregation: "sum", label: "Amount" }],
      filters: [],
      visualization: "bar"
    },
    created_at: new Date().toISOString(),
    is_favorite: false,
  },
  {
    id: "template-health-analysis",
    user_id: "template", // Added user_id property
    name: "Deal Health Analysis",
    description: "Analyze the health of your deals",
    config: {
      dimensions: [{ field: "health_score", type: "standard", label: "Health Score" }],
      metrics: [{ field: "deal_name", aggregation: "count", label: "Number of Deals" }],
      filters: [],
      visualization: "bar"
    },
    created_at: new Date().toISOString(),
    is_favorite: false,
  }
];

export function TemplateIcon({ type }: { type: string }) {
  switch (type) {
    case 'pie':
      return <PieChart className="h-4 w-4" />;
    case 'bar':
      return <BarChart className="h-4 w-4" />;
    case 'line':
      return <LineChart className="h-4 w-4" />;
    case 'table':
      return <Table className="h-4 w-4" />;
    default:
      return <BarChart className="h-4 w-4" />;
  }
}
