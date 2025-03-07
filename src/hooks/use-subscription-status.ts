
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionStatus } from "@/types/types";

export function useSubscriptionStatus() {
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionStatus>('free');
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: userData, isLoading } = useQuery({
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch subscription data",
        });
        return null;
      }

      const userSubscription = userData.subscription_status as SubscriptionStatus;
      setSubscriptionTier(userSubscription);
      return userData;
    },
    retry: 1,
  });

  return {
    subscriptionTier,
    isLoading,
    userData
  };
}
