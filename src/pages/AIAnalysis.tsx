import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApiError } from "@/hooks/use-api-error";
import { useAuth } from "@/hooks/useAuth";
import { useTeam } from "@/contexts/TeamContext";
import { useAIAnalysis } from "@/hooks/use-ai-analysis";
import { Deal, Insight } from "@/types/types";

// Components
import { MainHeader } from "@/components/layout/MainHeader";
import { AILoadingState } from "@/components/ai-analysis/AILoadingState";
import { AnalysisHeader } from "@/components/ai-analysis/AnalysisHeader";
import { AnalysisTabs } from "@/components/ai-analysis/AnalysisTabs";
import { AnalysisContent } from "@/components/ai-analysis/AnalysisContent";
import { AnalysisSettingsPanel } from "@/components/ai-analysis/AnalysisSettingsPanel";
import { FirstTimeExperience } from "@/components/ai-analysis/FirstTimeExperience";
import { AICapabilitiesExplainer } from "@/components/ai-analysis/AICapabilitiesExplainer";

export default function AIAnalysis() {
  const [selectedDeal, setSelectedDeal] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [activeTab, setActiveTab] = useState("deal-analysis");
  const [showAnalysisExplainer, setShowAnalysisExplainer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [piiFilter, setPiiFilter] = useState(false);
  const [retainAnalysis, setRetainAnalysis] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  
  const {
    insights,
    isAnalyzing,
    analysisId,
    isAnalysisLimited,
    analysisHistory,
    fetchInsights,
    analyzeDeals,
    loadAnalysisHistory,
    resetAnalysis,
    exportInsights,
    handleDealSelect,
    subscriptionTier,
    markActionItem,
    saveFollowupMessage,
    isActioning,
    generatedFollowup,
    generateFollowup,
    generatedFollowups
  } = useAIAnalysis();

  const { handleError, handleAuthCheck } = useApiError();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await handleAuthCheck();
        if (!userId) {
          navigate("/auth");
          return;
        }
        fetchDeals();
        loadAnalysisHistory();
        checkFirstTimeUser();
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    // Refetch deals when teams change
    if (user) {
      fetchDeals();
    }
  }, [currentTeam, user]);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("deals").select("*");
      
      if (currentTeam) {
        query = query.eq("team_id", currentTeam.id);
      } else {
        const userId = user?.user_id || (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          query = query.eq("user_id", userId);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
      handleError(error, "Failed to fetch deals");
    } finally {
      setIsLoading(false);
    }
  };

  const checkFirstTimeUser = async () => {
    try {
      // This would typically check user preferences in the database
      // For now we'll use localStorage as an example
      const hasSeenAITutorial = localStorage.getItem("hasSeenAITutorial");
      setIsFirstTime(!hasSeenAITutorial);
    } catch (error) {
      console.error("Error checking first time status:", error);
    }
  };

  const handleCompleteFirstTime = () => {
    localStorage.setItem("hasSeenAITutorial", "true");
    setIsFirstTime(false);
  };

  const handleAnalyzeDeal = (dealId: string) => {
    analyzeDeals(dealId, {}); // Call with empty params object
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainHeader userData={user} />
        <AILoadingState message="Loading AI Analysis..." />
      </div>
    );
  }

  if (isFirstTime) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainHeader userData={user} />
        <FirstTimeExperience onComplete={handleCompleteFirstTime} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainHeader userData={user} />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
        <AnalysisHeader
          subscriptionTier={subscriptionTier}
          onShowSettings={() => setShowSettings(true)}
          onShowExplainer={() => setShowAnalysisExplainer(true)}
        />

        {analysisId && (
          <AnalysisTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            deals={deals}
            selectedDeal={selectedDeal}
            isAnalyzing={isAnalyzing}
            isAnalysisLimited={isAnalysisLimited}
            insights={insights}
            onDealSelect={handleDealSelect}
            onAnalyze={handleAnalyzeDeal}
          />
        )}

        {activeTab === "history" ? (
          <div className="analysis-history my-4">
            {analysisHistory?.length ? (
              analysisHistory.map((analysis: any) => (
                <div
                  key={analysis.id}
                  className="cursor-pointer p-4 border rounded-lg mb-2 hover:bg-gray-50"
                  onClick={() => {
                    /* Add code to load a specific analysis */
                  }}
                >
                  <div className="font-medium">{analysis.deal?.deal_name || "Unnamed Deal"}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(analysis.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No analysis history found</div>
            )}
          </div>
        ) : (
          <AnalysisContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            deals={deals}
            selectedDeal={selectedDeal}
            isAnalyzing={isAnalyzing}
            isAnalysisLimited={isAnalysisLimited}
            insights={insights}
            onDealSelect={handleDealSelect}
            onAnalyze={handleAnalyzeDeal}
            onMarkActionItem={markActionItem}
            onSaveFollowup={saveFollowupMessage}
            isActioning={isActioning}
            onGenerateFollowup={generateFollowup}
            generatedFollowup={generatedFollowup}
            generatedFollowups={generatedFollowups}
            hasTeam={!!currentTeam}
            onExport={exportInsights}
          />
        )}
      </div>

      <AICapabilitiesExplainer 
        isOpen={showAnalysisExplainer}
        onClose={() => setShowAnalysisExplainer(false)}
      />

      <AnalysisSettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        piiFilter={piiFilter}
        setPiiFilter={setPiiFilter}
        retainAnalysis={retainAnalysis}
        setRetainAnalysis={setRetainAnalysis}
        subscriptionTier={subscriptionTier}
      />
    </div>
  );
}
