
import * as React from "react";
import { Deal, Insight } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { InsightsDisplay } from "./InsightsDisplay";
import { MessageGenerator } from "./MessageGenerator";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NextStepsTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealSelect: (dealId: string) => void;
  insights?: Insight[];
}

export function NextStepsTab({ deals, selectedDeal, onDealSelect, insights = [] }: NextStepsTabProps) {
  const [generateDripCampaign, setGenerateDripCampaign] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const dealInsights = insights.filter(insight => insight.deal_id === selectedDeal);
  const selectedDealData = deals.find(deal => deal.id === selectedDeal);
  
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            Next Steps Configuration
          </CardTitle>
          <CardDescription>
            Configure how you want to generate your next steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Deal
            </label>
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

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Generate Drip Campaign</label>
              <p className="text-sm text-gray-500">
                Create an automated follow-up sequence
              </p>
            </div>
            <Switch
              checked={generateDripCampaign}
              onCheckedChange={setGenerateDripCampaign}
            />
          </div>
        </CardContent>
        
        {!selectedDeal && (
          <CardFooter className="pt-0">
            <Alert variant="default" className="w-full bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                Please select a deal to generate next steps
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>

      {selectedDealData && (
        <>
          <InsightsDisplay 
            dealName={selectedDealData.deal_name}
            insights={dealInsights}
          />
          
          {dealInsights.length === 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                No insights available for this deal. Run an analysis first to generate next steps.
              </AlertDescription>
            </Alert>
          )}
          
          {dealInsights.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Generate Communication</CardTitle>
                <CardDescription>
                  Create personalized communication based on AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Next Steps'}
                </Button>
              </CardContent>
            </Card>
          )}
          
          <MessageGenerator 
            dealId={selectedDeal} 
            generateDripCampaign={generateDripCampaign}
          />
        </>
      )}
    </div>
  );
}
