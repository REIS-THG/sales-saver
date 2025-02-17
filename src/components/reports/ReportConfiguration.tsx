
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { ReportConfigurationProps } from "./types";
import { ReportPreview } from "./ReportPreview";
import { VisualizationTypeSelector } from "./components/VisualizationTypeSelector";
import { AxisFieldSelector } from "./components/AxisFieldSelector";

export const ReportConfiguration = ({
  report,
  onClose,
  onUpdate,
  standardFields,
  customFields,
  aggregations,
  visualizationTypes,
}: ReportConfigurationProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Customize your report visualization</CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
          <ResizablePanel defaultSize={40}>
            <div className="h-full p-6">
              <div className="space-y-6">
                <VisualizationTypeSelector
                  report={report}
                  visualizationTypes={visualizationTypes}
                  onUpdate={onUpdate}
                />
                
                <AxisFieldSelector
                  type="dimension"
                  report={report}
                  standardFields={standardFields}
                  customFields={customFields}
                  onUpdate={onUpdate}
                />
                
                <AxisFieldSelector
                  type="metric"
                  report={report}
                  standardFields={standardFields}
                  customFields={customFields}
                  aggregations={aggregations}
                  onUpdate={onUpdate}
                />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={60}>
            <div className="h-full p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="bg-white rounded-lg border p-4 h-[500px]">
                <ReportPreview config={report.config} data={[]} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </CardContent>
    </Card>
  );
};
