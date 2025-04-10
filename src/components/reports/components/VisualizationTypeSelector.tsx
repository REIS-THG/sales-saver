
import { Button } from "@/components/ui/button";
import type { ReportConfiguration, ReportVisualization } from "../types";

interface VisualizationTypeSelectorProps {
  report: ReportConfiguration;
  visualizationTypes: {
    value: ReportVisualization;
    label: string;
    icon: JSX.Element;
  }[];
  onUpdate: (reportId: string, updates: Partial<ReportConfiguration>) => Promise<void>;
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
