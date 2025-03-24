
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionStatus } from "@/types/types";

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

interface UseAnalysisActionsProps {
  subscriptionTier: SubscriptionStatus;
  selectedDeal: string | null;
}

export function useAnalysisActions({ subscriptionTier, selectedDeal }: UseAnalysisActionsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simulated progress for better UX
  const startProgressSimulation = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 1000);
    return interval;
  };

  // File upload mutation
  const fileUploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File, type: 'transcript' | 'email' | 'voice' }) => {
      // Check subscription status
      if (subscriptionTier !== 'pro') {
        throw new Error("File upload feature requires a Pro subscription");
      }
      
      const progressInterval = startProgressSimulation();
      
      try {
        // File upload logic here
        console.log('File upload:', file, type);
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return { success: true, message: "File processed successfully" };
      } finally {
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setTimeout(() => setAnalysisProgress(0), 1000);
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "File processed successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
      });
    }
  });

  // Deal analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async ({ dealId, params }: { dealId: string, params: AnalysisParams }) => {
      // Check subscription status for advanced features
      if (subscriptionTier !== 'pro' && (params.piiFilter || params.retainAnalysis)) {
        throw new Error("Advanced analysis features require a Pro subscription");
      }
      
      setIsAnalyzing(true);
      const progressInterval = startProgressSimulation();
      
      try {
        // Show initial toast
        toast({
          title: "Analysis started",
          description: "AI is analyzing your deal data...",
        });
        
        const response = await supabase.functions.invoke("analyze-deals", {
          body: { dealId, analysisParams: params },
        });

        if (response.error) {
          throw new Error(response.error.message || "Analysis failed");
        }

        return response.data;
      } finally {
        clearInterval(progressInterval);
        setAnalysisProgress(100);
        setTimeout(() => setAnalysisProgress(0), 1000);
      }
    },
    onSuccess: (data) => {
      const insightCount = data?.insights?.length || 0;
      toast({
        title: "Analysis complete",
        description: `Generated ${insightCount} insights for your deal`,
      });
      queryClient.invalidateQueries({ queryKey: ['insights', selectedDeal] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to analyze deal",
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    }
  });

  const analyzeDeal = async (dealId: string, params: AnalysisParams) => {
    await analysisMutation.mutateAsync({ dealId, params });
  };

  const handleFileUpload = async (file: File, type: 'transcript' | 'email' | 'voice') => {
    await fileUploadMutation.mutateAsync({ file, type });
  };

  return {
    isAnalyzing,
    analysisProgress,
    analyzeDeal,
    handleFileUpload,
  };
}
