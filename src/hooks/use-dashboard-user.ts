
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/types";

export function useDashboardUser() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    userData,
    loading,
    error,
    showUpgradeDialog,
    setShowUpgradeDialog,
    fetchUserData,
    handleSignOut
  };
}
