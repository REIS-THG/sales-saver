
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, ArrowUpRight, AlertCircle, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExampleInsight {
  type: 'risk' | 'opportunity' | 'action_item';
  content: string;
  confidence_score: number;
  coaching_suggestion?: string;
}

export function ExampleAnalyses({ onTryNow }: { onTryNow: () => void }) {
  const exampleInsights: ExampleInsight[] = [
    {
      type: 'risk',
      content: 'Decision maker has not been engaged in the last 3 meetings, suggesting potential loss of interest.',
      confidence_score: 85,
      coaching_suggestion: 'Schedule a direct call with the decision maker to re-engage them in the process.'
    },
    {
      type: 'opportunity',
      content: 'Client mentioned budget expansion in Q3, which aligns with our premium offering launch.',
      confidence_score: 73,
    },
    {
      type: 'action_item',
      content: 'Send pricing comparison document highlighting ROI versus competitors by Friday.',
      confidence_score: 92,
      coaching_suggestion: 'Personalize the document with the specific use cases mentioned in your last call.'
    },
  ];

  // Group insights by type for better organization
  const riskInsights = exampleInsights.filter(i => i.type === 'risk');
  const opportunityInsights = exampleInsights.filter(i => i.type === 'opportunity');
  const actionInsights = exampleInsights.filter(i => i.type === 'action_item');
  
  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Example Analysis
        </CardTitle>
        <CardDescription>
          See how AI can analyze your deals and provide actionable insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600 italic">This is an example of what AI analysis looks like for a sample deal:</p>
        
        {opportunityInsights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Opportunities
            </h3>
            <div className="space-y-3">
              {opportunityInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}
        
        {actionInsights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-blue-600 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Action Items
            </h3>
            <div className="space-y-3">
              {actionInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}
        
        {riskInsights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Risks
            </h3>
            <div className="space-y-3">
              {riskInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-4">
          <Button onClick={onTryNow} className="w-full sm:w-auto">
            Try on your own deals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: ExampleInsight }) {
  const getInsightColor = () => {
    switch (insight.type) {
      case 'risk': return 'bg-red-50 border-red-100';
      case 'opportunity': return 'bg-green-50 border-green-100';
      case 'action_item': return 'bg-blue-50 border-blue-100';
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
                insight.type === 'risk' ? 'bg-red-500' : 
                insight.type === 'opportunity' ? 'bg-green-500' : 
                'bg-blue-500'
              }`}
              style={{ width: `${insight.confidence_score}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
