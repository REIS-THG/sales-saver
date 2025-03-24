
import { useEffect } from "react";
import { useDashboardData } from "./use-dashboard-data";
import { useDashboardUser } from "./use-dashboard-user";
import { useDashboardState } from "./use-dashboard-state";

export function useDashboard() {
  const dataHook = useDashboardData();
  const userHook = useDashboardUser();
  const stateHook = useDashboardState();
  
  // Combine all the hooks
  return {
    // From data hook
    deals: dataHook.deals,
    customFields: dataHook.customFields,
    loading: dataHook.loading,
    error: dataHook.error,
    fetchDeals: dataHook.fetchDeals,
    fetchCustomFields: dataHook.fetchCustomFields,
    
    // From user hook
    userData: userHook.userData,
    showUpgradeDialog: userHook.showUpgradeDialog,
    setShowUpgradeDialog: userHook.setShowUpgradeDialog,
    fetchUserData: userHook.fetchUserData,
    handleSignOut: userHook.handleSignOut,
    
    // From state hook
    showCustomFields: stateHook.showCustomFields,
    setShowCustomFields: stateHook.setShowCustomFields,
    selectedDeals: stateHook.selectedDeals,
    setSelectedDeals: stateHook.setSelectedDeals,
    sortField: stateHook.sortField,
    setSortField: stateHook.setSortField,
    sortDirection: stateHook.sortDirection,
    setSortDirection: stateHook.setSortDirection,
    filters: stateHook.filters,
    handleSearch: stateHook.handleSearch,
    handleFilterChange: stateHook.handleFilterChange,
    handleStatusChange: stateHook.handleStatusChange,
    handleDealDelete: stateHook.handleDealDelete
  };
}
