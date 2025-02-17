
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/types';
import type { Json } from '@/integrations/supabase/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('Session found:', session);
        fetchUserData(session.user.id);
      } else {
        console.log('No session found');
        setLoading(false);
      }
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
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    console.log('Fetching user data for:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
      return;
    }

    if (data) {
      console.log('Raw user data:', data);
      // Ensure role is either 'sales_rep' or 'manager'
      const role = data.role === 'manager' ? 'manager' : 'sales_rep';
      
      // Ensure subscription_status is a valid value
      const subscription_status = ['free', 'pro', 'enterprise'].includes(data.subscription_status) 
        ? data.subscription_status as 'free' | 'pro' | 'enterprise'
        : 'free';

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
        billing_address: billing_address
      };

      console.log('Processed user data:', userData);
      setUser(userData);
    }
    setLoading(false);
  };

  return { user, loading };
}
