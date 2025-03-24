
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useApiError } from "@/hooks/use-api-error";
import type { Deal, CustomField, User } from "@/types/types";

export function useDashboardData() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleAuthCheck, handleError } = useApiError();

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await handleAuthCheck();
      if (!userId) return;

      // Fetch both personal deals and team deals
      const { data: dealsData, error: fetchError } = await supabase
        .from("deals")
        .select("*");

      if (fetchError) {
        handleError(fetchError, "Failed to fetch deals");
        setError(fetchError.message || "Failed to fetch deals");
        return;
      }

      const typedDeals: Deal[] = (dealsData || []).map((deal) => ({
        id: deal.id,
        deal_name: deal.deal_name,
        company_name: deal.company_name,
        amount: Number(deal.amount),
        status: (deal.status || 'open') as Deal['status'],
        health_score: deal.health_score || 50,
        user_id: deal.user_id,
        team_id: deal.team_id,
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
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  }, [handleAuthCheck, handleError]);

  const fetchCustomFields = useCallback(async () => {
    try {
      setLoading(true);
      
      const userId = await handleAuthCheck();
      if (!userId) return;

      const { data: fieldsData, error: fieldsError } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", userId);

      if (fieldsError) {
        handleError(fieldsError, "Failed to fetch custom fields");
        return;
      }
      
      const typedCustomFields: CustomField[] = (fieldsData || []).map(field => ({
        ...field,
        field_type: field.field_type as "text" | "number" | "boolean" | "date" | "multi-select"
      }));
      
      setCustomFields(typedCustomFields);
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch custom fields");
    } finally {
      setLoading(false);
    }
  }, [handleAuthCheck, handleError]);

  return {
    deals,
    customFields,
    loading,
    error,
    fetchDeals,
    fetchCustomFields
  };
}
