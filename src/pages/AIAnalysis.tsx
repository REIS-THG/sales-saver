
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAIAnalysis } from "@/hooks/use-ai-analysis";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DealAnalysisTab } from "@/components/ai-analysis/DealAnalysisTab";
import { NextStepsTab } from "@/components/ai-analysis/NextStepsTab";
import { AnalysisHistoryTab } from "@/components/ai-analysis/AnalysisHistoryTab";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";

const AIAnalysis = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    deals,
    selectedDeal,
    setSelectedDeal,
    insights,
    isLoading,
    isAnalyzing,
    error,
    analysisCount,
    subscriptionTier,
    fetchDeals,
    fetchInsights,
    analyzeDeal,
    handleFileUpload,
  } = useAIAnalysis();

  const [activeTab, setActiveTab] = useState<string>("analysis");
  const [piiFilter, setPiiFilter] = useState(true);
  const [retainAnalysis, setRetainAnalysis] = useState(subscriptionTier === 'pro');

  useEffect(() => {
    fetchDeals();
    const dealId = searchParams.get('dealId');
    if (dealId) {
      setSelectedDeal(dealId);
      fetchInsights(dealId);
    }
  }, [searchParams]);

  const isAnalysisLimited = subscriptionTier === 'free' && analysisCount >= 1;

  const handleDealSelect = (dealId: string) => {
    setSelectedDeal(dealId);
    fetchInsights(dealId);
  };

  const handleAnalyze = async (dealId: string) => {
    await analyzeDeal(dealId, {
      salesApproach: 'consultative_selling',
      industry: 'technology',
      purposeNotes: '',
      toneAnalysis: {
        formality: 0.7,
        persuasiveness: 0.8,
        urgency: 0.5,
      },
      communicationChannel: 'email',
      piiFilter,
      retainAnalysis,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onDealCreated={fetchDeals}
        customFields={[]}
        userData={null}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between space-x-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">AI Analysis</h1>
            <p className="text-sm text-gray-500">
              Analyze your deals with advanced AI insights
            </p>
          </div>
          
          {subscriptionTier === 'free' && (
            <Button
              variant="outline"
              onClick={() => navigate("/settings/subscription")}
              className="shrink-0"
            >
              <span>Upgrade to Pro</span>
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                Get Unlimited Analysis
              </span>
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAnalysisLimited && (
          <Alert className="mb-6">
            <AlertTitle>Analysis Limit Reached</AlertTitle>
            <AlertDescription>
              You've reached your free analysis limit. Upgrade to Pro for unlimited analysis and additional features.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pii-filter"
                    checked={piiFilter}
                    onCheckedChange={setPiiFilter}
                  />
                  <Label htmlFor="pii-filter" className="text-sm font-medium">
                    PII Data Filter
                  </Label>
                  <InfoIcon className="h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="retain-analysis"
                    checked={retainAnalysis}
                    onCheckedChange={setRetainAnalysis}
                    disabled={subscriptionTier === 'free'}
                  />
                  <Label htmlFor="retain-analysis" className="text-sm font-medium">
                    Retain Analysis History
                  </Label>
                  <InfoIcon className="h-4 w-4 text-gray-400" />
                  {subscriptionTier === 'free' && (
                    <span className="text-xs text-gray-500 ml-2">
                      Information used in analysis is not retained (Pro feature)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-6">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="analysis">Deal Analysis</TabsTrigger>
                <TabsTrigger value="next-steps">Next Step Assistant</TabsTrigger>
                <TabsTrigger value="history">Analysis History</TabsTrigger>
              </TabsList>
            </div>
            
            <Separator />

            <TabsContent value="analysis" className="p-6">
              <DealAnalysisTab
                deals={deals}
                selectedDeal={selectedDeal}
                isAnalyzing={isAnalyzing}
                isAnalysisLimited={isAnalysisLimited}
                onDealSelect={handleDealSelect}
                onAnalyze={handleAnalyze}
                onFileUpload={handleFileUpload}
                insights={insights}
              />
            </TabsContent>

            <TabsContent value="next-steps" className="p-6">
              <NextStepsTab
                deals={deals}
                selectedDeal={selectedDeal}
                onDealSelect={handleDealSelect}
                insights={insights}
              />
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <AnalysisHistoryTab
                insights={insights}
                deals={deals}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
