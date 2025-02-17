
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Deal, CustomField, User } from "@/types/types";

export function useDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserData = async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    setUserData(data as User);
  };

  const fetchCustomFields = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: fieldsData, error: fieldsError } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", userId);

      if (fieldsError) throw fieldsError;
      
      const typedCustomFields: CustomField[] = (fieldsData || []).map(field => ({
        ...field,
        field_type: field.field_type as "text" | "number" | "boolean" | "date"
      }));
      
      setCustomFields(typedCustomFields);
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch custom fields",
      });
    }
  };

  const fetchDeals = async () => {
    try {
      setError(null);
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: dealsData, error: fetchError } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const typedDeals: Deal[] = (dealsData || []).map((deal) => ({
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
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return {
    deals,
    customFields,
    loading,
    error,
    showCustomFields,
    setShowCustomFields,
    userData,
    showUpgradeDialog,
    setShowUpgradeDialog,
    fetchUserData,
    fetchCustomFields,
    fetchDeals,
    handleSignOut
  };
}
