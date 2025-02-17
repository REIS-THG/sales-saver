import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Trash2 } from "lucide-react";
import type { StandardField, CustomField } from "@/types/types";
import { ReportConfigurationProps } from "./types";
import { ReportPreview } from "./ReportPreview";

export const ReportConfiguration = ({
  report,
  onClose,
  onUpdate,
  standardFields,
  customFields,
  aggregations,
  visualizationTypes,
}: ReportConfigurationProps) => {
  const mapFieldToOption = (field: StandardField | CustomField) => {
    const fieldType = field.field_type as "text" | "number" | "boolean" | "date";
    return {
      field: 'field' in field ? field.field : field.field_name,
      field_name: field.field_name,
      field_type: fieldType
    };
  };

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
                {/* Visualization Type Section */}
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

                {/* X Axis Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">X Axis (Categories)</label>
                  <Select
                    onValueChange={(value) => {
                      const allFields = [...standardFields, ...customFields].map(mapFieldToOption);
                      const field = allFields.find(f => f.field === value);
                      if (field) {
                        const newDimension = {
                          field: value,
                          type: 'standard' as const,
                          label: field.field_name
                        };
                        onUpdate(report.id, {
                          ...report,
                          config: {
                            ...report.config,
                            dimensions: [...report.config.dimensions, newDimension]
                          }
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add X axis category" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...standardFields, ...customFields].map((field) => {
                        const mappedField = mapFieldToOption(field);
                        return (
                          <SelectItem key={mappedField.field} value={mappedField.field}>
                            {mappedField.field_name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 space-y-2">
                    {report.config.dimensions.map((dim, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span>{dim.label}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newDimensions = report.config.dimensions.filter((_, i) => i !== index);
                            onUpdate(report.id, {
                              ...report,
                              config: {
                                ...report.config,
                                dimensions: newDimensions
                              }
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Y Axis Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Y Axis (Values)</label>
                  <Select
                    onValueChange={(value) => {
                      const allFields = [...standardFields, ...customFields].map(mapFieldToOption);
                      const field = allFields.find(f => f.field === value);
                      if (field) {
                        const newMetric = {
                          field: value,
                          aggregation: 'sum' as const,
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
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add Y axis value" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...standardFields, ...customFields]
                        .map(mapFieldToOption)
                        .filter(field => field.field_type === 'number')
                        .map((field) => (
                          <SelectItem key={field.field} value={field.field}>
                            {field.field_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 space-y-2">
                    {report.config.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <span>{metric.label}</span>
                          <Select
                            value={metric.aggregation}
                            onValueChange={(value) => {
                              const newMetrics = report.config.metrics.map((m, i) => 
                                i === index ? { ...m, aggregation: value as any } : m
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
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newMetrics = report.config.metrics.filter((_, i) => i !== index);
                            onUpdate(report.id, {
                              ...report,
                              config: {
                                ...report.config,
                                metrics: newMetrics
                              }
                            });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
