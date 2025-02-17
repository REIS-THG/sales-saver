import { Deal, Insight } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ArrowUpRight, MessageSquare, Send, ShieldAlert, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface NextStepsTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealSelect: (dealId: string) => void;
  insights?: Insight[];
}

export function NextStepsTab({ deals, selectedDeal, onDealSelect, insights = [] }: NextStepsTabProps) {
  const dealInsights = insights.filter(insight => insight.deal_id === selectedDeal);
  const selectedDealData = deals.find(deal => deal.id === selectedDeal);

  const [communicationType, setCommunicationType] = useState<string>('email');
  const [formality, setFormality] = useState<number[]>([50]);
  const [persuasiveness, setPersuasiveness] = useState<number[]>([50]);
  const [urgency, setUrgency] = useState<number[]>([50]);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-message', {
        body: {
          dealId: selectedDeal,
          communicationType,
          toneSettings: {
            formality: formality[0],
            persuasiveness: persuasiveness[0],
            urgency: urgency[0]
          }
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setGeneratedMessage(response.data.message);
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
        <>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Generate Communication
              </CardTitle>
              <CardDescription>
                Customize and generate a message based on the analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Communication Type</label>
                  <Select value={communicationType} onValueChange={setCommunicationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select communication type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="message">Direct Message</SelectItem>
                      <SelectItem value="call_script">Call Script</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Formality</label>
                    <Slider
                      value={formality}
                      onValueChange={setFormality}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Persuasiveness</label>
                    <Slider
                      value={persuasiveness}
                      onValueChange={setPersuasiveness}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Urgency</label>
                    <Slider
                      value={urgency}
                      onValueChange={setUrgency}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerateMessage}
                  disabled={isGenerating}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Message'}
                </Button>
              </div>

              {generatedMessage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Generated Message</label>
                  <Textarea
                    value={generatedMessage}
                    readOnly
                    className="min-h-[200px]"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigator.clipboard.writeText(generatedMessage)}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
