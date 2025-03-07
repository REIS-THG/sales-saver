
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Deal, User, SubscriptionStatus } from "@/types/types";
import type { Json } from "@/integrations/supabase/types";

export function useDealDesk() {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isGenerating, setIsGenerating] = useState<'sow' | 'contract' | 'invoice' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isProSubscription, setIsProSubscription] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      const subscriptionStatus: SubscriptionStatus = userData.subscription_status === true ? 'pro' : 'free';

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

  // Fetch deals when component mounts
  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data: dealsData, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
      return;
    }

    // Cast the data to match the Deal type
    const typedDeals = dealsData?.map(deal => ({
      ...deal,
      status: deal.status as Deal['status'],
      custom_fields: (deal.custom_fields || {}) as Record<string, any>,
      contact_email: deal.contact_email || null,
      contact_first_name: deal.contact_first_name || null,
      contact_last_name: deal.contact_last_name || null,
      company_url: deal.company_url || null,
      notes: deal.notes || null,
      team_id: deal.team_id || null,
      health_score: deal.health_score || 0,
      next_action: deal.next_action || null,
      notes_count: deal.notes_count || 0,
      last_contacted: deal.last_contacted || null,
      last_note_at: deal.last_note_at || null,
      expected_close_date: deal.expected_close_date || null,
      start_date: deal.start_date || null
    })) ?? [];

    setDeals(typedDeals);
  };

  const handleGenerate = async (type: 'sow' | 'contract' | 'invoice') => {
    if (!selectedDealId) {
      toast({
        title: "Select a Deal",
        description: "Please select a deal to generate the document.",
      });
      return;
    }

    if (!isProSubscription) {
      toast({
        variant: "destructive",
        title: "Pro Subscription Required",
        description: "This feature requires a Pro subscription. Please upgrade your plan to continue.",
      });
      return;
    }

    setIsGenerating(type);
    try {
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', selectedDealId)
        .single();

      if (dealError) throw new Error("Failed to fetch deal details");

      // Call the appropriate edge function based on document type
      const response = await supabase.functions.invoke(`generate-${type}`, {
        body: { dealId: selectedDealId, dealData }
      });

      if (response.error) throw new Error(response.error.message);

      // Create and trigger download of document
      const documentContent = type === 'sow' 
        ? response.data.sow 
        : type === 'contract' 
          ? response.data.contract 
          : response.data.invoice;

      const filename = `${dealData.deal_name.replace(/\s+/g, '_')}_${type}.txt`;
      
      const blob = new Blob([documentContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${type.toUpperCase()} generated and downloaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate document",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return {
    selectedDealId,
    setSelectedDealId,
    deals,
    isGenerating,
    isProSubscription,
    handleGenerate
  };
}
