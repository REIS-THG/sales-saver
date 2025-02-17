
import { Deal, Insight } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ArrowUpRight, ShieldAlert } from "lucide-react";

interface NextStepsTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealSelect: (dealId: string) => void;
  insights?: Insight[];
}

export function NextStepsTab({ deals, selectedDeal, onDealSelect, insights = [] }: NextStepsTabProps) {
  const dealInsights = insights.filter(insight => insight.deal_id === selectedDeal);
  const selectedDealData = deals.find(deal => deal.id === selectedDeal);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Deal</label>
        <Select value={selectedDeal || ''} onValueChange={onDealSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a deal to view next steps" />
          </SelectTrigger>
          <SelectContent>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                {deal.deal_name} - {deal.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDealData && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedDealData.deal_name}</CardTitle>
            <CardDescription>AI-Generated Next Steps and Recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dealInsights.length > 0 ? (
              dealInsights.map((insight) => (
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
                        {insight.coaching_suggestion && (
                          <p className="text-sm text-purple-600 mt-2">
                            Coaching Suggestion: {insight.coaching_suggestion}
                          </p>
                        )}
                        {insight.confidence_score && (
                          <div className="flex items-center gap-2 mt-2">
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
              ))
            ) : (
              <p className="text-gray-500">No analysis results available for this deal yet. Please run an analysis first.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
