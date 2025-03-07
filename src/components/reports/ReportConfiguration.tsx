
import { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AxisFieldSelector } from "./components/AxisFieldSelector";
import { VisualizationTypeSelector } from "./components/VisualizationTypeSelector";
import { ReportPreview } from "./ReportPreview";
import type { ReportConfiguration as ReportConfigType } from "./types";

interface ReportConfigurationProps {
  report: ReportConfigType;
  onClose: () => void;
  onUpdate: (reportId: string, updates: Partial<ReportConfigType>) => Promise<void>;
  standardFields: {
    field: string;
    field_name: string;
    field_type: "text" | "number" | "boolean" | "date" | "product";
  }[];
  customFields: {
    id: string;
    field_name: string;
    field_type: "text" | "number" | "boolean" | "date" | "product";
    is_required: boolean;
  }[];
  aggregations: {
    value: "sum" | "avg" | "count" | "min" | "max";
    label: string;
  }[];
  visualizationTypes: {
    value: ReportConfigType["config"]["visualization"];
    label: string;
    icon: JSX.Element;
  }[];
}

export function ReportConfiguration({
  report,
  onClose,
  onUpdate,
  standardFields,
  customFields,
  aggregations,
  visualizationTypes,
}: ReportConfigurationProps) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleUpdate = async (updates: Partial<ReportConfigType>) => {
    setLoading(true);
    try {
      await onUpdate(report.id, updates);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = (updates: Partial<ReportConfigType["config"]>) => {
    startTransition(() => {
      void handleUpdate({
        config: {
          ...report.config,
          ...updates,
        },
      });
    });
  };

  // Generate preview data based on selected dimensions and metrics
  useEffect(() => {
    if (!report.config.dimensions.length || !report.config.metrics.length) {
      setPreviewData([]);
      return;
    }

    // Generate data based on the selected dimension and metric
    const dimensionField = report.config.dimensions[0]?.field || "";
    const metricField = report.config.metrics[0]?.field || "";
    const aggregationType = report.config.metrics[0]?.aggregation || "sum";
    
    // Generate sample data based on dimension type
    const dimensionInfo = standardFields.find(f => f.field === dimensionField) || 
                          customFields.find(f => f.id === dimensionField);
    
    const generatedData = [];
    
    if (dimensionInfo) {
      if (dimensionInfo.field_type === "date") {
        // Date-based data (last 6 months)
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          generatedData.push({
            dimension: date.toISOString(),
            value: Math.floor(Math.random() * 1000) + 500
          });
        }
      } else if (dimensionInfo.field_type === "text") {
        // Category-based data
        const categories = ["Category A", "Category B", "Category C", "Category D", "Category E"];
        categories.forEach(category => {
          generatedData.push({
            dimension: category,
            value: Math.floor(Math.random() * 1000) + 500
          });
        });
      } else {
        // Number-based data (ranges)
        const ranges = ["0-100", "101-500", "501-1000", "1001-5000", "5000+"];
        ranges.forEach(range => {
          generatedData.push({
            dimension: range,
            value: Math.floor(Math.random() * 1000) + 500
          });
        });
      }
    }
    
    setPreviewData(generatedData);
  }, [report.config.dimensions, report.config.metrics, standardFields, customFields]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-none">
          <div className="flex items-center justify-between">
            <DialogTitle>Configure Report</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex gap-6 flex-1 min-h-0">
          <div className="w-1/3 space-y-6 overflow-y-auto p-1">
            <AxisFieldSelector
              type="dimension"
              report={report}
              standardFields={standardFields}
              customFields={customFields}
              onUpdate={(reportId, updates) => onUpdate(reportId, updates)}
            />
            
            <AxisFieldSelector
              type="metric"
              report={report}
              standardFields={standardFields}
              customFields={customFields}
              aggregations={aggregations}
              onUpdate={(reportId, updates) => onUpdate(reportId, updates)}
            />

            <VisualizationTypeSelector
              report={report}
              visualizationTypes={visualizationTypes}
              onUpdate={(reportId, updates) => onUpdate(reportId, updates)}
            />
          </div>

          <div className="w-2/3 overflow-y-auto border rounded-lg p-4">
            <ReportPreview
              config={report.config}
              data={previewData}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
