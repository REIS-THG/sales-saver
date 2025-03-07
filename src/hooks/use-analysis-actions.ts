
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // File upload mutation
  const fileUploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File, type: 'transcript' | 'email' | 'voice' }) => {
      // Check subscription status
      if (subscriptionTier !== 'pro') {
        throw new Error("File upload feature requires a Pro subscription");
      }
      
      // File upload logic here
      console.log('File upload:', file, type);
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
      const response = await supabase.functions.invoke("analyze-deals", {
        body: { dealId, analysisParams: params },
      });

      if (response.error) {
        throw new Error(response.error.message || "Analysis failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deal analysis completed",
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
    analyzeDeal,
    handleFileUpload,
  };
}
