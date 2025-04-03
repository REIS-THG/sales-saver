
import { useDashboardPage } from "@/hooks/use-dashboard-page";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { DashboardModals } from "@/components/dashboard/DashboardModals";
import { DashboardWidgetsSection } from "@/components/dashboard/DashboardWidgetsSection";

export default function Dashboard() {
  const {
    // Auth and user data
    user,
    isAuthLoading,
    signOut,
    
    // Deals data
    deals,
    customFields,
    loading,
    error,
    
    // Selection state
    selectedDealId,
    selectedDeal,
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
  } = useDashboardPage();

  return (
    <DashboardLayout
      isLoading={isAuthLoading}
      userData={user}
      onSignOut={signOut}
      onDealCreated={handleDealCreated}
      customFields={customFields}
      onBeforeCreate={handleBeforeCreate}
      showCreateDealModal={showCreateDealModal}
      setShowCreateDealModal={setShowCreateDealModal}
      resetTour={resetTour}
    >
      <TourComponent />
      
      <DashboardWidgetsSection 
        deals={deals} 
        userData={user} 
        loading={loading} 
        error={error}
        teamName={currentTeam?.name}
      />
      
      <DashboardActions
        selectedDeals={selectedDeals}
        onDeleteDeals={handleBulkDelete}
        onChangeStatus={handleStatusChange}
        onClearSelection={() => setSelectedDeals([])}
      />

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

      <DashboardModals
        showCreateDealModal={showCreateDealModal}
        onCloseCreateModal={() => setShowCreateDealModal(false)}
        onDealCreated={handleDealCreated}
        onBeforeCreate={handleBeforeCreate}
        customFields={customFields}
        showAutomationSettings={showAutomationSettings}
        setShowAutomationSettings={setShowAutomationSettings}
        userData={user}
        isQuickNoteModalOpen={isQuickNoteModalOpen}
        setIsQuickNoteModalOpen={setIsQuickNoteModalOpen}
        selectedDealId={selectedDealId}
        selectedDeal={selectedDeal}
        onNoteAdded={handleNoteAdded}
        currentTeam={currentTeam}
      />
    </DashboardLayout>
  );
}
