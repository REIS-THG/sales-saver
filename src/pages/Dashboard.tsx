
import { useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

const FREE_DEAL_LIMIT = 5;

const Dashboard = () => {
  const {
    deals,
    customFields,
    loading,
    error,
    showCustomFields,
    setShowCustomFields,
    userData,
    showUpgradeDialog,
    setShowUpgradeDialog,
    fetchUserData,
    fetchCustomFields,
    fetchDeals,
    handleSignOut
  } = useDashboard();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchDeals();
      fetchCustomFields();
    }
  }, [userData]);

  const handleCreateDeal = async () => {
    if (userData?.subscription_status === 'free' && deals.length >= FREE_DEAL_LIMIT) {
      setShowUpgradeDialog(true);
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && !deals.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchDeals}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onDealCreated={fetchDeals}
        customFields={customFields}
        onBeforeCreate={handleCreateDeal}
        onSignOut={handleSignOut}
      />
      <DashboardContent
        deals={deals}
        customFields={customFields}
        showCustomFields={showCustomFields}
        setShowCustomFields={setShowCustomFields}
        userData={userData}
      />
    </div>
  );
};

export default Dashboard;
