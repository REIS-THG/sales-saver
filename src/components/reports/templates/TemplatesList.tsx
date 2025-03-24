
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { reportTemplates, TemplateIcon } from "./ReportTemplates";
import type { ReportConfiguration } from "@/components/reports/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

interface TemplatesListProps {
  onUseTemplate: (template: ReportConfiguration) => Promise<void>;
}

export function TemplatesList({ onUseTemplate }: TemplatesListProps) {
  const { toast } = useToast();
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);

  const handleUseTemplate = async (template: ReportConfiguration) => {
    try {
      setLoadingTemplateId(template.id);
      await onUseTemplate(template);
      toast({
        title: "Template applied",
        description: `"${template.name}" template has been applied successfully.`,
      });
    } catch (error) {
      console.error("Error applying template:", error);
      toast({
        variant: "destructive",
        title: "Failed to apply template",
        description: "There was an error applying the template. Please try again.",
      });
    } finally {
      setLoadingTemplateId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportTemplates.map((template) => (
        <Card key={template.id} className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TemplateIcon type={template.config.visualization} />
              <CardTitle className="text-md">{template.name}</CardTitle>
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <div className="space-y-1">
              <div>
                <span className="font-medium">Dimensions:</span>{" "}
                {template.config.dimensions[0]?.label || "None"}
              </div>
              <div>
                <span className="font-medium">Metrics:</span>{" "}
                {template.config.metrics[0]?.label || "None"}
              </div>
              <div>
                <span className="font-medium">Chart Type:</span>{" "}
                {template.config.visualization.charAt(0).toUpperCase() + 
                 template.config.visualization.slice(1)}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleUseTemplate(template)} 
              variant="outline" 
              className="w-full"
              disabled={loadingTemplateId === template.id}
            >
              {loadingTemplateId === template.id ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Applying...
                </>
              ) : "Use This Template"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
