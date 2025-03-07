
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Deal } from "@/types/types";

export function useDeals() {
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
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

  const fetchDeals = () => queryClient.invalidateQueries({ queryKey: ['deals'] });

  return {
    deals,
    isLoading,
    selectedDeal,
    setSelectedDeal,
    fetchDeals,
  };
}
