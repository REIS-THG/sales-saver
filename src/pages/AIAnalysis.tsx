
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAIAnalysis } from "@/hooks/use-ai-analysis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnalysisHeader } from "@/components/ai-analysis/AnalysisHeader";
import { AnalysisSettings } from "@/components/ai-analysis/AnalysisSettings";
import { AnalysisTabs } from "@/components/ai-analysis/AnalysisTabs";

interface AnalysisParams {
  salesApproach: 'consultative_selling' | 'solution_selling' | 'transactional_selling' | 'value_based_selling';
  industry: string;
  purposeNotes: string;
  toneAnalysis: {
    formality: number;
    persuasiveness: number;
    urgency: number;
  };
  communicationChannel: 'f2f' | 'email' | 'social_media';
  piiFilter: boolean;
  retainAnalysis: boolean;
}

const AIAnalysis = () => {
  const [searchParams] = useSearchParams();
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
    const params: AnalysisParams = {
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
    };
    await analyzeDeal(dealId, params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onDealCreated={fetchDeals}
        customFields={[]}
        userData={null}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalysisHeader subscriptionTier={subscriptionTier} />

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
          <AnalysisSettings
            piiFilter={piiFilter}
            setPiiFilter={setPiiFilter}
            retainAnalysis={retainAnalysis}
            setRetainAnalysis={setRetainAnalysis}
            subscriptionTier={subscriptionTier}
          />

          <AnalysisTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            deals={deals}
            selectedDeal={selectedDeal}
            isAnalyzing={isAnalyzing}
            isAnalysisLimited={isAnalysisLimited}
            insights={insights}
            onDealSelect={handleDealSelect}
            onAnalyze={handleAnalyze}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
