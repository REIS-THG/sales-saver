
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Deal, Insight } from "@/types/types";

export function useDealGenius() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDeals = async () => {
    setIsLoading(true);
    setError(null);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to fetch deals");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
      return;
    }

    const typedDeals: Deal[] = (data || []).map(deal => ({
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

    setDeals(typedDeals);
    setIsLoading(false);
  };

  const fetchInsights = async (dealId: string) => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("deal_insights")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to fetch insights");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch insights",
      });
    } else if (data) {
      const typedInsights: Insight[] = data.map(insight => ({
        ...insight,
        insight_type: insight.insight_type as 'risk' | 'opportunity' | 'action_item',
        word_choice_analysis: insight.word_choice_analysis as Record<string, any> || {},
        source_data: insight.source_data as Record<string, any> || {},
        tone_analysis: insight.tone_analysis as Record<string, any> || {},
        priority: 'medium',
        status: 'open'
      }));
      
      setInsights(typedInsights);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (file: File, type: 'transcript' | 'email' | 'voice') => {
    // Implementation for file upload
    console.log('File upload:', file, type);
    // Add your file upload logic here
  };

  const analyzeDeal = async (
    dealId: string,
    analysisParams: {
      salesApproach: Insight['sales_approach'];
      industry: string;
      purposeNotes: string;
      toneAnalysis: {
        formality: number;
        persuasiveness: number;
        urgency: number;
      };
      communicationChannel: 'f2f' | 'email' | 'social_media';
    }
  ) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await supabase.functions.invoke("analyze-deals", {
        body: {
          dealId,
          analysisParams,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Analysis failed");
      }

      await fetchInsights(dealId);
      toast({
        title: "Success",
        description: "Deal analysis completed",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze deal";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
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
  };
}
