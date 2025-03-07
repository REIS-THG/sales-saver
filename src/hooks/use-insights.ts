
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Insight } from "@/types/types";

interface UseInsightsProps {
  selectedDeal: string | null;
}

export function useInsights({ selectedDeal }: UseInsightsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
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
        priority: 'medium' as const,
        status: 'open' as const
      }));
    },
    enabled: !!selectedDeal,
    retry: 2,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const fetchInsights = (dealId: string) => {
    queryClient.invalidateQueries({ queryKey: ['insights', dealId] });
  };

  return {
    insights,
    isLoading,
    fetchInsights,
  };
}
