
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
    fetchDeals,
    fetchInsights,
    analyzeDeal,
    handleFileUpload,
  };
}
