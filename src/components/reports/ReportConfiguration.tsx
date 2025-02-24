
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { ReportConfigurationProps } from "./types";
import { ReportPreview } from "./ReportPreview";
import { VisualizationTypeSelector } from "./components/VisualizationTypeSelector";
import { AxisFieldSelector } from "./components/AxisFieldSelector";
import { X } from "lucide-react";

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
    <Card className="fixed inset-4 z-50 flex flex-col bg-background">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Configure Report: {report.name}</CardTitle>
            <CardDescription>Customize your report visualization</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ResizablePanelGroup direction="horizontal" className="min-h-0 rounded-lg">
          <ResizablePanel defaultSize={40}>
            <div className="h-full p-6 overflow-y-auto">
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
            <div className="h-full p-6 overflow-y-auto">
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
