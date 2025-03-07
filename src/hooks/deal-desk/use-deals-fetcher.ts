
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Deal } from "@/types/types";

export function useDealsFetcher() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const { toast } = useToast();

  const fetchDeals = async () => {
    const { data: dealsData, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
      return;
    }

    // Cast the data to match the Deal type
    const typedDeals = dealsData?.map(deal => ({
      ...deal,
      status: deal.status as Deal['status'],
      custom_fields: (deal.custom_fields || {}) as Record<string, any>,
      contact_email: deal.contact_email || null,
      contact_first_name: deal.contact_first_name || null,
      contact_last_name: deal.contact_last_name || null,
      company_url: deal.company_url || null,
      notes: deal.notes || null,
      team_id: deal.team_id || null,
      health_score: deal.health_score || 0,
      next_action: deal.next_action || null,
      notes_count: deal.notes_count || 0,
      last_contacted: deal.last_contacted || null,
      last_note_at: deal.last_note_at || null,
      expected_close_date: deal.expected_close_date || null,
      start_date: deal.start_date || null
    })) ?? [];

    setDeals(typedDeals);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchDeals();
  }, []);

  return {
    deals,
    fetchDeals
  };
}
