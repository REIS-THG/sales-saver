
import { useState, useTransition } from "react";
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
              data={[
                { dimension: "Category A", value: 30 },
                { dimension: "Category B", value: 45 },
                { dimension: "Category C", value: 60 },
              ]}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
