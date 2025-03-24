
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
import type { Deal } from "@/types/types";

const CreateDealForm = lazy(() => 
  import("@/components/deals/CreateDealForm").then(module => ({ default: module.default || module }))
);

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
    isLoading,
    selectedDeals,
    setSelectedDeals,
    customFields,
    fetchDeals,
    handleStatusChange,
    handleDealDelete,
    handleSearch,
    handleFilterChange,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    filters,
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
  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
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
      const { data: userData, error } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("user_id", userId)
        .single();

      if (error) {
        handleError(error, "Failed to check subscription status");
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
        userData={user}
        onSignOut={handleSignOut}
        onCreateDeal={() => setShowCreateDealModal(true)}
        onOpenAutomationSettings={() => setShowAutomationSettings(true)}
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {selectedDeals.length > 0 && (
          <BulkActionsMenu
            selectedDeals={selectedDeals}
            onDelete={handleDealDelete}
            onStatusChange={handleStatusChange}
            onClearSelection={() => setSelectedDeals([])}
          />
        )}

        <DashboardContent
          deals={deals}
          loading={isLoading}
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
          onDealDelete={handleDealDelete}
          onFetchDeals={fetchDeals}
          onQuickNote={handleQuickNote}
          customFields={customFields}
          userData={user}
        />
      </main>

      {showCreateDealModal && (
        <Suspense fallback={<ReportsLoadingState />}>
          <CreateDealForm
            onDealCreated={handleDealCreated}
            onBeforeCreate={handleBeforeCreate}
            customFields={customFields}
            onSignOut={handleSignOut}
            userData={user}
          />
        </Suspense>
      )}

      <QuickNoteModal
        deal={deals.find((d) => d.id === selectedDealId) || null}
        isOpen={isQuickNoteModalOpen}
        onClose={() => setIsQuickNoteModalOpen(false)}
        onNoteAdded={handleNoteAdded}
      />

      <AutomationSettingsDialog
        open={showAutomationSettings}
        onClose={() => setShowAutomationSettings(false)}
        userData={user}
      />
    </div>
  );
}
