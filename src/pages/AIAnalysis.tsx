
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAIAnalysis } from "@/hooks/use-ai-analysis";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DealAnalysisTab } from "@/components/ai-analysis/DealAnalysisTab";
import { NextStepsTab } from "@/components/ai-analysis/NextStepsTab";
import { AnalysisHistoryTab } from "@/components/ai-analysis/AnalysisHistoryTab";

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
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between space-x-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">AI Analysis</h1>
              <p className="text-sm text-gray-500">
                Analyze your deals with advanced AI insights
              </p>
            </div>
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
