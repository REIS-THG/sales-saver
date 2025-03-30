
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAIAnalysis } from "@/hooks/use-ai-analysis";
import { AnalysisHeader } from "@/components/ai-analysis/AnalysisHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTeam } from "@/contexts/TeamContext";
import { MainHeader } from "@/components/layout/MainHeader";
import { Insight, SubscriptionStatus } from "@/types/types";
import { AnalysisAlerts } from "@/components/ai-analysis/AnalysisAlerts";
import { FirstTimeExperience } from "@/components/ai-analysis/FirstTimeExperience";
import { AnalysisContent } from "@/components/ai-analysis/AnalysisContent";
import { AnalysisLoadingStates } from "@/components/ai-analysis/AnalysisLoadingStates";
import { useTour } from "@/hooks/use-tour";
import { useIsMobile } from "@/hooks/use-mobile";
import { TeamPresence } from "@/components/team/TeamPresence";

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
  const { currentTeam } = useTeam();
  const { TourComponent, resetTour } = useTour('ai-analysis');
  const isMobile = useIsMobile();
  
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
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    const hasVisitedAIAnalysis = localStorage.getItem('hasVisitedAIAnalysis');
    if (!hasVisitedAIAnalysis) {
      setIsFirstVisit(true);
      localStorage.setItem('hasVisitedAIAnalysis', 'true');
    }
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/auth");
    }
    if (user) {
      setRetainAnalysis(user.subscription_status === 'pro');
    }
  }, [userLoading, user, navigate]);

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
  }, [searchParams, user, currentTeam]);

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

  const handleTryNow = () => {
    setIsFirstVisit(false);
    if (deals.length > 0 && !selectedDeal) {
      handleDealSelect(deals[0].id);
    }
  };

  const isLoading = userLoading || dataLoading;

  const loadingState = (
    <AnalysisLoadingStates
      isLoading={isLoading}
      isAnalyzing={isAnalyzing}
      user={user}
      selectedDeal={selectedDeal}
      deals={deals}
    />
  );

  if (isLoading) {
    return loadingState;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TourComponent />
      <MainHeader userData={user} />

      <div className={`mx-auto ${isMobile ? 'px-2' : 'px-4 sm:px-6 lg:px-8'} py-4 sm:py-6 max-w-7xl`}>
        <div className="flex justify-between items-center">
          <AnalysisHeader subscriptionTier={userSubscriptionTier} />
          
          {selectedDeal && currentTeam && (
            <TeamPresence analysisId={selectedDeal} />
          )}
        </div>

        <AnalysisAlerts error={error} isAnalysisLimited={isAnalysisLimited} />

        <FirstTimeExperience 
          isFirstVisit={isFirstVisit} 
          isAnalyzing={isAnalyzing}
          onTryNow={handleTryNow} 
        />

        {isAnalyzing && loadingState}

        {(!isFirstVisit || selectedDeal) && (
          <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${isMobile ? 'mt-3' : 'mt-6'}`}>
            <AnalysisContent
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
              piiFilter={piiFilter}
              setPiiFilter={setPiiFilter}
              retainAnalysis={retainAnalysis}
              setRetainAnalysis={setRetainAnalysis}
              subscriptionTier={userSubscriptionTier as SubscriptionStatus}
              teamContext={currentTeam ? true : false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
