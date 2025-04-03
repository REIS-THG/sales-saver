
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/hooks/use-dashboard";
import { useApiError } from "@/hooks/use-api-error";
import { useAuth } from "@/hooks/useAuth";
import { useTour } from "@/hooks/use-tour";
import { useTeam } from "@/contexts/TeamContext";
import type { Deal } from "@/types/types";

export function useDashboardPage() {
  const navigate = useNavigate();
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const { TourComponent, resetTour } = useTour('dashboard');
  const { currentTeam } = useTeam();

  const {
    deals,
    customFields,
    loading,
    error,
    fetchDeals,
    fetchCustomFields,
    handleSignOut,
    selectedDeals,
    setSelectedDeals,
    handleStatusChange,
    handleDealDelete,
    handleSearch,
    handleFilterChange,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filters
  } = useDashboard();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await handleAuthCheck();
        if (!userId) {
          navigate("/auth");
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };
    checkAuth();
  }, [navigate, handleAuthCheck]);

  // Refetch deals when the team changes
  useEffect(() => {
    if (user) {
      fetchDeals();
      fetchCustomFields();
    }
  }, [user, currentTeam, fetchDeals, fetchCustomFields]);

  const handleLocalSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDealCreated = async () => {
    await fetchDeals();
    setShowCreateDealModal(false);
  };

  const handleBeforeCreate = async () => {
    try {
      const userId = await handleAuthCheck();
      if (!userId) return false;

      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        handleError(fetchError, "Failed to check subscription status");
        return false;
      }

      const freeUserDealLimit = 10;
      if (!userData.subscription_status && deals.length >= freeUserDealLimit) {
        handleError(
          new Error(`Free accounts are limited to ${freeUserDealLimit} deals`),
          "Subscription Limit Reached"
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  const handleBulkDelete = async (dealIds: string[]) => {
    for (const dealId of dealIds) {
      await handleDealDelete(dealId);
    }
  };

  const handleQuickNote = (deal: Deal) => {
    setSelectedDealId(deal.id);
    setIsQuickNoteModalOpen(true);
  };

  const handleNoteAdded = async () => {
    await fetchDeals();
    setIsQuickNoteModalOpen(false);
    setSelectedDealId(null);
  };

  return {
    // Auth and user data
    user,
    isAuthLoading,
    signOut: handleLocalSignOut,
    
    // Deals data
    deals,
    customFields,
    loading,
    error,
    
    // Selection state
    selectedDealId,
    selectedDeal: deals.find(d => d.id === selectedDealId) || null,
    selectedDeals,
    setSelectedDeals,
    
    // Modal state
    showCreateDealModal,
    setShowCreateDealModal,
    showAutomationSettings,
    setShowAutomationSettings,
    isQuickNoteModalOpen,
    setIsQuickNoteModalOpen,
    
    // Actions
    handleDealCreated,
    handleBeforeCreate,
    handleBulkDelete,
    handleQuickNote,
    handleNoteAdded,
    handleStatusChange,
    handleSearch,
    handleFilterChange,
    handleDealDelete,
    
    // Sorting
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filters,
    
    // Team
    currentTeam,
    
    // Tour
    TourComponent,
    resetTour,
    
    // Functions
    fetchDeals
  };
}
