
import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/hooks/use-dashboard";
import { BulkActionsMenu } from "@/components/dashboard/BulkActionsMenu";
import { useApiError } from "@/hooks/use-api-error";
import { useAuth } from "@/hooks/useAuth";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { QuickNoteModal } from "@/components/dashboard/QuickNoteModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { AutomationSettingsDialog } from "@/components/dashboard/AutomationSettingsDialog";
import { CreateDealForm } from "@/components/deals/CreateDealForm";
import type { Deal } from "@/types/types";

// Instead of lazy loading, we'll import the component directly
// const CreateDealForm = lazy(() => import("@/components/deals/CreateDealForm"));

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);

  // Dashboard state and handlers
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

  // Check if user is authenticated
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

  // Handle sign out
  const handleLocalSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle creating a new deal
  const handleDealCreated = async () => {
    await fetchDeals();
    setShowCreateDealModal(false);
  };

  // Check before creating a deal if the user has subscription status
  const handleBeforeCreate = async () => {
    try {
      const userId = await handleAuthCheck();
      if (!userId) return false;

      // Get user data to check subscription status
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        handleError(fetchError, "Failed to check subscription status");
        return false;
      }

      // If the user is not a paid subscriber, they have a deal limit
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

  // Handle opening quick note modal for a deal
  const handleQuickNote = (deal: Deal) => {
    setSelectedDealId(deal.id);
    setIsQuickNoteModalOpen(true);
  };

  // Handle when a note is added
  const handleNoteAdded = async () => {
    await fetchDeals();
    setIsQuickNoteModalOpen(false);
    setSelectedDealId(null);
  };

  if (isAuthLoading) {
    return <ReportsLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        onDealCreated={handleDealCreated}
        customFields={customFields}
        onBeforeCreate={handleBeforeCreate}
        onSignOut={handleLocalSignOut}
        userData={user}
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {selectedDeals.length > 0 && (
          <BulkActionsMenu
            selectedDeals={selectedDeals}
            onDeleteDeals={handleDealDelete}
            onChangeStatus={handleStatusChange}
            onClearSelection={() => setSelectedDeals([])}
          />
        )}

        <DashboardContent
          deals={deals}
          isLoading={loading}
          selectedDeals={selectedDeals}
          onDealSelect={(deal, selected) => {
            if (selected) {
              setSelectedDeals((prev) => [...prev, deal]);
            } else {
              setSelectedDeals((prev) =>
                prev.filter((d) => d.id !== deal.id)
              );
            }
          }}
          onSelectAll={(allDeals) => setSelectedDeals(allDeals)}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          filters={filters}
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          onDeleteDeal={handleDealDelete}
          onFetchDeals={fetchDeals}
          onQuickNote={handleQuickNote}
          customFields={customFields}
          userData={user}
        />
      </main>

      {showCreateDealModal && (
        <CreateDealForm
          open={showCreateDealModal}
          onClose={() => setShowCreateDealModal(false)}
          onSuccess={handleDealCreated}
          onBeforeCreate={handleBeforeCreate}
          customFields={customFields}
        />
      )}

      <QuickNoteModal
        deal={deals.find((d) => d.id === selectedDealId) || null}
        isOpen={isQuickNoteModalOpen}
        onClose={() => setIsQuickNoteModalOpen(false)}
        onNoteAdded={handleNoteAdded}
      />

      <AutomationSettingsDialog
        open={showAutomationSettings}
        onOpenChange={setShowAutomationSettings}
        userData={user}
      />
    </div>
  );
}
