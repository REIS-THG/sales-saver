
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useSubscriptionStatus = () => {
  const [subscriptionTier, setSubscriptionTier] = useState<"free" | "pro" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isLoading: userLoading } = useAuth();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (userLoading) return;
      if (!user) {
        setSubscriptionTier("free");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Query the users table to get subscription status
        const { data, error } = await supabase
          .from("users")
          .select("subscription_status")
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw error;
        }

        // Convert boolean to tier string
        setSubscriptionTier(data?.subscription_status ? "pro" : "free");
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Default to free if there's an error
        setSubscriptionTier("free");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, userLoading]);

  return {
    subscriptionTier,
    isLoading,
    error,
    isPro: subscriptionTier === "pro",
  };
};
