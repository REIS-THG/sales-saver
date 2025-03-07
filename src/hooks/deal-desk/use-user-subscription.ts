
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types/types";

export function useUserSubscription() {
  const [user, setUser] = useState<User | null>(null);
  const [isProSubscription, setIsProSubscription] = useState(false);
  const navigate = useNavigate();

  // Fetch user data and subscription status
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate("/auth");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return;
      }

      // Process custom_views to ensure it's an array of records
      const customViews = Array.isArray(userData.custom_views) 
        ? userData.custom_views.map(view => {
            // Ensure each view is an object
            return typeof view === 'object' && view !== null ? view as Record<string, any> : {};
          })
        : [];

      // Handle subscription status conversion properly
      const subscriptionStatus = userData.subscription_status === true ? 'pro' : 'free';

      // Properly handle billing_address which might be a JSON object
      const billingAddressData = userData.billing_address;
      const billingAddress = typeof billingAddressData === 'object' && billingAddressData !== null
        ? {
            street: (billingAddressData as Record<string, string>).street || '',
            city: (billingAddressData as Record<string, string>).city || '',
            state: (billingAddressData as Record<string, string>).state || '',
            country: (billingAddressData as Record<string, string>).country || '',
            postal_code: (billingAddressData as Record<string, string>).postal_code || ''
          }
        : undefined;

      // Process user data to ensure it conforms to User type
      const processedUser: User = {
        id: userData.id,
        user_id: userData.user_id,
        full_name: userData.full_name,
        role: (userData.role as User['role']) || 'sales_rep',
        theme: userData.theme,
        default_deal_view: userData.default_deal_view,
        custom_views: customViews,
        email: userData.email || '',
        subscription_status: subscriptionStatus,
        subscription_end_date: userData.subscription_end_date,
        successful_deals_count: userData.successful_deals_count || 0,
        billing_address: billingAddress,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      setUser(processedUser);
      setIsProSubscription(processedUser.subscription_status === 'pro');
    };

    fetchUserData();
  }, [navigate]);

  return {
    user,
    isProSubscription
  };
}
