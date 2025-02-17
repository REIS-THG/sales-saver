
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { ReportConfiguration, ReportDimension, ReportMetric } from "../types";

interface AxisFieldSelectorProps {
  type: "dimension" | "metric";
  report: ReportConfiguration;
  standardFields: { 
    field_name: string; 
    field: string; 
    field_type: "text" | "number" | "boolean" | "date"; 
  }[];
  customFields: { 
    id: string; 
    field_name: string; 
    field_type: "text" | "number" | "boolean" | "date"; 
    is_required: boolean; 
    user_id?: string; 
  }[];
  aggregations?: { value: 'sum' | 'avg' | 'count' | 'min' | 'max'; label: string; }[];
  onUpdate: (reportId: string, updates: Partial<ReportConfiguration>) => void;
}

export const AxisFieldSelector = ({
  type,
  report,
  standardFields,
  customFields,
  aggregations,
  onUpdate,
}: AxisFieldSelectorProps) => {
  const mapFieldToOption = (field: AxisFieldSelectorProps["standardFields"][0] | AxisFieldSelectorProps["customFields"][0]) => {
    return {
      field_name: field.field_name,
      field: 'field' in field ? field.field : field.field_name,
      field_type: field.field_type
    };
  };

  const handleValueChange = (value: string) => {
    const allFields = [...standardFields, ...customFields].map(mapFieldToOption);
    const field = allFields.find(f => f.field === value);
    if (!field) return;

    if (type === "dimension") {
      const newDimension: ReportDimension = {
        field: value,
        type: 'standard',
        label: field.field_name
      };
      onUpdate(report.id, {
        ...report,
        config: {
          ...report.config,
          dimensions: [...report.config.dimensions, newDimension]
        }
      });
    } else {
      const newMetric: ReportMetric = {
        field: value,
        aggregation: 'sum',
        label: `Sum of ${field.field_name}`
      };
      onUpdate(report.id, {
        ...report,
        config: {
          ...report.config,
          metrics: [...report.config.metrics, newMetric]
        }
      });
    }
  };

  const items = type === "dimension" 
    ? report.config.dimensions
    : report.config.metrics;

  const label = type === "dimension" 
    ? "X Axis (Categories)"
    : "Y Axis (Values)";

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Add ${type === "dimension" ? "X axis category" : "Y axis value"}`} />
        </SelectTrigger>
        <SelectContent>
          {[...standardFields, ...customFields]
            .map(mapFieldToOption)
            .filter(field => type === "dimension" ? true : field.field_type === 'number')
            .map((field) => (
              <SelectItem key={field.field} value={field.field}>
                {field.field_name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2">
              <span>{item.label}</span>
              {type === "metric" && aggregations && (
                <Select
                  value={(item as ReportMetric).aggregation}
                  onValueChange={(value) => {
                    const newMetrics = report.config.metrics.map((m, i) => 
                      i === index ? { ...m, aggregation: value as ReportMetric["aggregation"] } : m
                    );
                    onUpdate(report.id, {
                      ...report,
                      config: {
                        ...report.config,
                        metrics: newMetrics
                      }
                    });
                  }}
                >
                  <SelectTrigger className="h-7 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aggregations.map((agg) => (
                      <SelectItem key={agg.value} value={agg.value}>
                        {agg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (type === "dimension") {
                  const newDimensions = report.config.dimensions.filter((_, i) => i !== index);
                  onUpdate(report.id, {
                    ...report,
                    config: {
                      ...report.config,
                      dimensions: newDimensions
                    }
                  });
                } else {
                  const newMetrics = report.config.metrics.filter((_, i) => i !== index);
                  onUpdate(report.id, {
                    ...report,
                    config: {
                      ...report.config,
                      metrics: newMetrics
                    }
                  });
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
