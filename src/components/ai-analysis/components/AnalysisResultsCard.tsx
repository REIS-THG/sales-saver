
import React from "react";
import { Insight } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, ArrowUpRight, AlertCircle, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalysisResultsCardProps {
  insights: Insight[];
}

export function AnalysisResultsCard({ insights }: AnalysisResultsCardProps) {
  if (insights.length === 0) return null;
  
  // Group insights by type for better organization
  const riskInsights = insights.filter(i => i.insight_type === 'risk');
  const opportunityInsights = insights.filter(i => i.insight_type === 'opportunity');
  const actionInsights = insights.filter(i => i.insight_type === 'action_item');
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Analysis Results
        </CardTitle>
        <CardDescription>
          AI-generated insights and recommendations to help grow your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {opportunityInsights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Opportunities ({opportunityInsights.length})
            </h3>
            <div className="space-y-3">
              {opportunityInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        )}
        
        {actionInsights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Action Items ({actionInsights.length})
            </h3>
            <div className="space-y-3">
              {actionInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        )}
        
        {riskInsights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Risks ({riskInsights.length})
            </h3>
            <div className="space-y-3">
              {riskInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const getInsightColor = () => {
    switch (insight.insight_type) {
      case 'risk': return 'bg-red-50 border-red-100';
      case 'opportunity': return 'bg-green-50 border-green-100';
      case 'action_item': return 'bg-blue-50 border-blue-100';
      default: return 'bg-gray-50 border-gray-100';
    }
  };
  
  return (
    <div className={`rounded-lg border p-3 ${getInsightColor()}`}>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium">{insight.content}</p>
          {insight.confidence_score && (
            <Badge variant="outline" className="text-xs">
              {insight.confidence_score}% confidence
            </Badge>
          )}
        </div>
        
        {insight.coaching_suggestion && (
          <div className="text-xs text-purple-700 bg-purple-50 p-2 rounded border border-purple-100">
            <span className="font-semibold">Coaching tip:</span> {insight.coaching_suggestion}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                insight.insight_type === 'risk' ? 'bg-red-500' : 
                insight.insight_type === 'opportunity' ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ width: `${insight.confidence_score || 50}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
