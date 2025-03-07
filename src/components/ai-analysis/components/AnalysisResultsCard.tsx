
import React from "react";
import { Insight } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, ArrowUpRight, AlertCircle } from "lucide-react";

interface AnalysisResultsCardProps {
  insights: Insight[];
}

export function AnalysisResultsCard({ insights }: AnalysisResultsCardProps) {
  if (insights.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis Results</CardTitle>
        <CardDescription>
          Generated insights and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {insight.insight_type === 'risk' && (
                  <ShieldAlert className="h-5 w-5 text-red-500 mt-1" />
                )}
                {insight.insight_type === 'opportunity' && (
                  <ArrowUpRight className="h-5 w-5 text-green-500 mt-1" />
                )}
                {insight.insight_type === 'action_item' && (
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-1" />
                )}
                <div className="space-y-1.5">
                  <p className="text-sm font-medium capitalize">
                    {insight.insight_type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {insight.content}
                  </p>
                  {insight.confidence_score && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${insight.confidence_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {insight.confidence_score}% confidence
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
