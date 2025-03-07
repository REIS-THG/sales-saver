
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Deal, Insight, SubscriptionStatus } from "@/types/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export function useAIAnalysis() {
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionStatus>('free');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user subscription status
  useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return null;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return null;
      }

      const userSubscription = userData.subscription_status as SubscriptionStatus;
      setSubscriptionTier(userSubscription);
      return userData;
    },
    retry: 1,
  });

  // Fetch deals with proper caching
  const { data: deals = [], isLoading: isLoadingDeals } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        navigate("/auth");
        return [];
      }

      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch deals",
        });
        throw error;
      }

      return (data || []).map(deal => ({
        id: deal.id,
        deal_name: deal.deal_name,
        company_name: deal.company_name,
        amount: Number(deal.amount),
        status: (deal.status || 'open') as Deal['status'],
        health_score: deal.health_score || 50,
        user_id: deal.user_id,
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        start_date: deal.start_date,
        expected_close_date: deal.expected_close_date,
        last_contacted: deal.last_contacted,
        next_action: deal.next_action,
        contact_email: deal.contact_email,
        contact_first_name: deal.contact_first_name,
        contact_last_name: deal.contact_last_name,
        company_url: deal.company_url,
        notes: typeof deal.notes === 'string' ? deal.notes : '',
        custom_fields: typeof deal.custom_fields === 'object' ? deal.custom_fields : {},
        last_note_at: deal.last_note_at,
        notes_count: deal.notes_count
      }));
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Fetch insights with proper caching
  const { data: insights = [], isLoading: isLoadingInsights } = useQuery({
    queryKey: ['insights', selectedDeal],
    queryFn: async () => {
      if (!selectedDeal) return [];

      const { data, error } = await supabase
        .from("deal_insights")
        .select("*")
        .eq("deal_id", selectedDeal)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch insights",
        });
        throw error;
      }

      return (data || []).map(insight => ({
        ...insight,
        insight_type: insight.insight_type as 'risk' | 'opportunity' | 'action_item',
        word_choice_analysis: insight.word_choice_analysis as Record<string, any> || {},
        source_data: insight.source_data as Record<string, any> || {},
        tone_analysis: insight.tone_analysis as Record<string, any> || {},
        priority: 'medium',
        status: 'open'
      }));
    },
    enabled: !!selectedDeal,
    retry: 2,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

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
    deals,
    selectedDeal,
    setSelectedDeal,
    insights,
    isLoading: isLoadingDeals || isLoadingInsights,
    isAnalyzing,
    error: null,
    analysisCount: insights.length,
    subscriptionTier,
    fetchDeals: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
    fetchInsights: (dealId: string) => {
      setSelectedDeal(dealId);
      queryClient.invalidateQueries({ queryKey: ['insights', dealId] });
    },
    analyzeDeal,
    handleFileUpload,
  };
}
