
import { Button } from "@/components/ui/button";
import type { ReportConfiguration } from "../types";

interface VisualizationTypeSelectorProps {
  report: ReportConfiguration;
  visualizationTypes: {
    value: "bar" | "line" | "pie" | "table";
    label: string;
    icon: JSX.Element;
  }[];
  onUpdate: (reportId: string, updates: Partial<ReportConfiguration>) => void;
}

export const VisualizationTypeSelector = ({
  report,
  visualizationTypes,
  onUpdate,
}: VisualizationTypeSelectorProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Visualization Type</h3>
      <div className="grid grid-cols-2 gap-2">
        {visualizationTypes.map((type) => (
          <Button
            key={type.value}
            variant={report.config.visualization === type.value ? "default" : "outline"}
            onClick={() => {
              onUpdate(report.id, {
                ...report,
                config: {
                  ...report.config,
                  visualization: type.value
                }
              });
            }}
            className="flex items-center justify-start gap-2"
          >
            {type.icon}
            <span>{type.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
