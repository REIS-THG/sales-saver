
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@/types/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
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
      // Ensure role is either 'sales_rep' or 'manager'
      const role = data.role === 'manager' ? 'manager' : 'sales_rep';
      
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
        custom_views: data.custom_views || [],
        email: data.email,
        subscription_status: data.subscription_status || 'free',
        subscription_end_date: data.subscription_end_date,
        successful_deals_count: data.successful_deals_count || 0,
        billing_address: data.billing_address || {}
      };

      setUser(userData);
    }
    setLoading(false);
  };

  return { user, loading };
}
