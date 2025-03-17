
import { Insight } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ArrowUpRight, ShieldAlert, Brain, LightbulbIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InsightsDisplayProps {
  dealName: string;
  insights: Insight[];
}

export function InsightsDisplay({ dealName, insights }: InsightsDisplayProps) {
  // Group insights by type
  const actionItems = insights.filter(i => i.insight_type === 'action_item');
  const opportunities = insights.filter(i => i.insight_type === 'opportunity');
  const risks = insights.filter(i => i.insight_type === 'risk');
  
  if (insights.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>{dealName}</span>
            </CardTitle>
            <CardDescription>AI-Generated Analysis Results</CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {insights.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {actionItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-blue-700 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              Recommended Actions ({actionItems.length})
            </h3>
            {actionItems.map((insight) => (
              <InsightItem key={insight.id} insight={insight} />
            ))}
          </div>
        )}
        
        {opportunities.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-green-700 flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4" />
              Growth Opportunities ({opportunities.length})
            </h3>
            {opportunities.map((insight) => (
              <InsightItem key={insight.id} insight={insight} />
            ))}
          </div>
        )}
        
        {risks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-red-700 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              Potential Risks ({risks.length})
            </h3>
            {risks.map((insight) => (
              <InsightItem key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InsightItem({ insight }: { insight: Insight }) {
  const getBackgroundColor = () => {
    switch (insight.insight_type) {
      case 'risk': return 'bg-red-50 border-red-200';
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'action_item': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className={`p-3 rounded-md border ${getBackgroundColor()}`}>
      <div className="space-y-2">
        <p className="text-sm">{insight.content}</p>
        
        {insight.coaching_suggestion && (
          <div className="flex items-start gap-2 bg-purple-50 p-2 rounded border border-purple-100">
            <LightbulbIcon className="h-4 w-4 text-purple-500 mt-0.5" />
            <p className="text-xs text-purple-700">{insight.coaching_suggestion}</p>
          </div>
        )}
        
        {insight.confidence_score && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  insight.insight_type === 'risk' ? 'bg-red-500' : 
                  insight.insight_type === 'opportunity' ? 'bg-green-500' : 
                  'bg-blue-500'
                }`}
                style={{ width: `${insight.confidence_score}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {insight.confidence_score}% confidence
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
