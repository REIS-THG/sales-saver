
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useApiError } from "@/hooks/use-api-error";
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
  const { handleAuthCheck, handleError } = useApiError();

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        navigate("/auth");
        return;
      }

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
        if (error.code === 'PGRST116') {
          // No data found error - handle gracefully
          toast({
            variant: "destructive",
            title: "User profile not found",
            description: "Please complete your profile setup",
          });
          // Redirect to profile setup or handle as needed
          return;
        }
        throw error;
      }

      // Map subscription status from boolean to string enum
      const subscription_status = data.subscription_status ? 'pro' : 'free' as const;

      const billingAddressData = data.billing_address as Record<string, string> | null;
      const billingAddress = {
        street: billingAddressData?.street || '',
        city: billingAddressData?.city || '',
        state: billingAddressData?.state || '',
        country: billingAddressData?.country || '',
        postal_code: billingAddressData?.postal_code || ''
      };

      setUserData({
        ...data,
        id: data.id,
        user_id: data.user_id || authData.user.id,
        full_name: data.full_name,
        role: data.role as 'sales_rep' | 'manager',
        theme: data.theme,
        default_deal_view: data.default_deal_view,
        custom_views: Array.isArray(data.custom_views) 
          ? data.custom_views.map(view => typeof view === 'string' ? JSON.parse(view) : view)
          : [],
        email: data.email,
        subscription_status: subscription_status,
        subscription_end_date: data.subscription_end_date,
        successful_deals_count: data.successful_deals_count || 0,
        billing_address: billingAddress,
        created_at: data.created_at,
        updated_at: data.updated_at
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

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
        field_type: field.field_type as "text" | "number" | "boolean" | "date"
      }));
      
      setCustomFields(typedCustomFields);
    } catch (err) {
      console.error("Error fetching custom fields:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch custom fields");
    } finally {
      setLoading(false);
    }
  }, [handleAuthCheck, handleError]);

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

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign out failed",
          description: error.message,
        });
        return;
      }
      navigate("/auth");
    } catch (err) {
      console.error("Error signing out:", err);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

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
