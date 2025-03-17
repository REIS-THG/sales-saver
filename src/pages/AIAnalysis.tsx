
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAIAnalysis } from "@/hooks/use-ai-analysis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnalysisHeader } from "@/components/ai-analysis/AnalysisHeader";
import { AnalysisSettings } from "@/components/ai-analysis/AnalysisSettings";
import { AnalysisTabs } from "@/components/ai-analysis/AnalysisTabs";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { Insight } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";
import { MainHeader } from "@/components/layout/MainHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";

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
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useAuth();
  
  const {
    deals,
    selectedDeal,
    setSelectedDeal,
    insights: rawInsights,
    isLoading: dataLoading,
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
  const [retainAnalysis, setRetainAnalysis] = useState(user?.subscription_status === 'pro');

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/auth");
    }
    if (user) {
      setRetainAnalysis(user.subscription_status === 'pro');
    }
  }, [userLoading, user, navigate]);

  // Transform insights to ensure they match the expected type
  const insights: Insight[] = rawInsights.map(insight => ({
    ...insight,
    priority: insight.priority as "high" | "medium" | "low",
    status: insight.status as "open" | "acknowledged" | "resolved"
  }));

  useEffect(() => {
    if (user) {
      fetchDeals();
      const dealId = searchParams.get('dealId');
      if (dealId) {
        setSelectedDeal(dealId);
        fetchInsights(dealId);
      }
    }
  }, [searchParams, user]);

  // Use user's subscription status directly to ensure consistency
  const userSubscriptionTier = user?.subscription_status || 'free';
  const isAnalysisLimited = userSubscriptionTier === 'free' && analysisCount >= 1;

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

  const isLoading = userLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainHeader userData={user} />
        <ReportsLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader userData={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnalysisHeader subscriptionTier={userSubscriptionTier} />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAnalysisLimited && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Limit Reached</AlertTitle>
            <AlertDescription>
              You've reached your free analysis limit. Upgrade to Pro for unlimited analysis and additional features.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <h2 className="text-xl font-semibold tracking-tight">AI-Powered Deal Intelligence</h2>
                <p className="text-muted-foreground mt-1">
                  Analyze your deals, get next step recommendations, and track progress over time
                </p>
              </div>
              
              <Separator />
              
              <AnalysisSettings
                piiFilter={piiFilter}
                setPiiFilter={setPiiFilter}
                retainAnalysis={retainAnalysis}
                setRetainAnalysis={setRetainAnalysis}
                subscriptionTier={userSubscriptionTier}
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
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
