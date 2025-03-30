
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
    handleFileUpload 
  } = useAnalysisActions({ subscriptionTier, selectedDeal });

  // Mocking the additional functions that aren't actually implemented in useAnalysisActions
  const markActionItem = (id: string, status: boolean) => {
    console.log('Marking action item', id, status);
    return Promise.resolve();
  };
  
  const saveFollowupMessage = (id: string, content: string) => {
    console.log('Saving followup message', id, content);
    return Promise.resolve();
  };
  
  const isActioning = false;
  const generatedFollowup = '';
  const generatedFollowups = [];
  
  const generateFollowup = (dealId: string, type: string) => {
    console.log('Generating followup', dealId, type);
    return Promise.resolve();
  };

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
  const analyzeDeals = async (dealId: string, params: any) => {
    if (!dealId) return;
    
    try {
      await analyzeDeal(dealId, params);
      setAnalysisId(dealId); // Set the analysisId to the dealId as a fallback
      fetchInsights(dealId);
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
