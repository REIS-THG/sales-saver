
import { useState, useEffect } from "react";
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
import { useTour } from "@/hooks/use-tour";
import { useIsMobile } from "@/hooks/use-mobile";
import { HelpButton } from "@/components/ui/help-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"; // Added Plus icon import
import type { Deal } from "@/types/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showAutomationSettings, setShowAutomationSettings] = useState(false);
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { TourComponent, resetTour } = useTour('dashboard');

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

  const handleQuickNote = (deal: Deal) => {
    setSelectedDealId(deal.id);
    setIsQuickNoteModalOpen(true);
  };

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
      <TourComponent />
      
      <DashboardHeader
        onDealCreated={() => setShowCreateDealModal(true)}
        customFields={customFields}
        onBeforeCreate={handleBeforeCreate}
        onSignOut={handleLocalSignOut}
        userData={user}
        onResetTour={resetTour}
        className="dashboard-header"
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {isMobile && deals.length > 0 && (
          <div className="mb-4 flex justify-between items-center">
            <HelpButton
              tooltipContent="Tap on any deal to view details or add notes. Use the filters to narrow down your view."
              side="bottom"
            />
            <Button
              onClick={() => setShowCreateDealModal(true)}
              className="create-deal-button bg-indigo-600 hover:bg-indigo-700 text-white"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Deal
            </Button>
          </div>
        )}

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
          className="dashboard-content"
        />
      </main>

      {showCreateDealModal && (
        <CreateDealForm
          open={showCreateDealModal}
          onClose={() => setShowCreateDealModal(false)}
          onSuccess={handleDealCreated}
          onBeforeCreate={handleBeforeCreate}
          customFields={customFields}
          className="deal-form"
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
