
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/types';
import type { Json } from '@/integrations/supabase/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('Session found:', session);
        fetchUserData(session.user.id);
      } else {
        console.log('No session found');
        setIsLoading(false);
      }
    }).catch(err => {
      console.error('Error getting session:', err);
      setError(err);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        console.log('Auth state changed - session found:', session);
        fetchUserData(session.user.id);
      } else {
        console.log('Auth state changed - no session');
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data for:', userId);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setError(error);
        setIsLoading(false);
        return;
      }

      if (data) {
        console.log('Raw user data:', data);
        // Ensure role is either 'sales_rep' or 'manager'
        const role = data.role === 'manager' ? 'manager' : 'sales_rep';
        
        // Ensure custom_views is an array
        const custom_views = Array.isArray(data.custom_views) 
          ? data.custom_views as Record<string, any>[]
          : [];

        // Ensure billing_address is a valid object
        const billingAddressData = data.billing_address as { [key: string]: Json };
        const billing_address = typeof billingAddressData === 'object' && billingAddressData
          ? {
              street: (billingAddressData.street as string) || undefined,
              city: (billingAddressData.city as string) || undefined,
              state: (billingAddressData.state as string) || undefined,
              country: (billingAddressData.country as string) || undefined,
              postal_code: (billingAddressData.postal_code as string) || undefined
            }
          : {};

        // Map the subscription status to the correct type
        const subscription_status = data.subscription_status === true ? 'pro' : 'free' as 'free' | 'pro' | 'enterprise';

        // Create a properly typed User object
        const userData: User = {
          id: data.id,
          user_id: data.user_id,
          full_name: data.full_name,
          role: role,
          created_at: data.created_at,
          updated_at: data.updated_at,
          theme: data.theme,
          default_deal_view: data.default_deal_view,
          custom_views: custom_views,
          email: data.email,
          subscription_status: subscription_status,
          subscription_end_date: data.subscription_end_date,
          successful_deals_count: Number(data.successful_deals_count) || 0,
          billing_address: billing_address,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id
        };

        console.log('Processed user data:', userData);
        setUser(userData);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Unexpected error in fetchUserData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const isAuthenticated = !!user;

  return { user, isLoading, error, signOut, isAuthenticated };
}
