
import { useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
      {showUpgradeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
            <p className="text-gray-600 mb-4">
              You've reached the limit of {FREE_DEAL_LIMIT} deals on the free plan. 
              Upgrade to Pro for unlimited deals and more features!
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeDialog(false)}
              >
                Cancel
              </Button>
              <Link to="/subscription">
                <Button>Upgrade Now</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
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
}

export default Dashboard;
