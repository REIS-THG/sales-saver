
import { useState, useEffect } from "react";
import { useDeals } from "./use-deals";
import { useInsights } from "./use-insights";
import { useSubscriptionStatus } from "./use-subscription-status";
import { useAnalysisActions } from "./use-analysis-actions";

export function useAIAnalysis() {
  const { subscriptionTier, isLoading: isLoadingSubscription } = useSubscriptionStatus();
  const { 
    deals, 
    isLoading: isLoadingDeals, 
    selectedDeal, 
    setSelectedDeal, 
    fetchDeals 
  } = useDeals();
  
  const { 
    insights, 
    isLoading: isLoadingInsights, 
    fetchInsights 
  } = useInsights({ selectedDeal });
  
  const { 
    isAnalyzing, 
    analyzeDeal, 
    handleFileUpload,
    markActionItem,
    saveFollowupMessage,
    isActioning,
    generatedFollowup,
    generateFollowup,
    generatedFollowups
  } = useAnalysisActions({ subscriptionTier, selectedDeal });

  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isAnalysisLimited, setIsAnalysisLimited] = useState(false);

  // Check if user has hit their analysis limit based on subscription tier
  useEffect(() => {
    if (subscriptionTier === 'free') {
      // For example, check if they've used their free analysis quota
      setIsAnalysisLimited(false); // This would use some logic to check against quotas
    } else {
      setIsAnalysisLimited(false);
    }
  }, [subscriptionTier, insights]);

  // Handle deal selection
  const handleDealSelect = (dealId: string) => {
    setSelectedDeal(dealId);
    fetchInsights(dealId);
  };

  // Analyze deals with parameters
  const analyzeDeals = async (params: any) => {
    if (!selectedDeal) return;
    
    try {
      const result = await analyzeDeal(selectedDeal, params);
      if (result?.id) {
        setAnalysisId(result.id);
        fetchInsights(selectedDeal);
      }
    } catch (error) {
      console.error("Error analyzing deal:", error);
    }
  };

  // Load analysis history
  const loadAnalysisHistory = async () => {
    // This would fetch analysis history from the backend
    setAnalysisHistory([]);
  };

  // Reset analysis state
  const resetAnalysis = () => {
    setAnalysisId(null);
  };

  // Export insights to a document
  const exportInsights = async () => {
    // This would handle exporting the insights
    return true;
  };

  const isLoading = isLoadingDeals || isLoadingInsights || isLoadingSubscription;

  return {
    deals,
    selectedDeal,
    setSelectedDeal,
    insights,
    isLoading,
    isAnalyzing,
    error: null,
    analysisCount: insights.length,
    subscriptionTier,
    analysisId,
    isAnalysisLimited,
    analysisHistory,
    fetchDeals,
    fetchInsights,
    analyzeDeals,
    handleFileUpload,
    loadAnalysisHistory,
    resetAnalysis,
    exportInsights,
    handleDealSelect,
    markActionItem,
    saveFollowupMessage,
    isActioning,
    generatedFollowup,
    generateFollowup,
    generatedFollowups
  };
}
