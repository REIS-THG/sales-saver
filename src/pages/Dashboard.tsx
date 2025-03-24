import { useEffect } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  const isMobile = useIsMobile();

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
    if (!userData?.subscription_status && deals.length >= FREE_DEAL_LIMIT) {
      setShowUpgradeDialog(true);
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !deals.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchDeals} variant="outline">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {showUpgradeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
              You've reached the limit of {FREE_DEAL_LIMIT} deals on the free plan. 
              Upgrade to Pro for unlimited deals and more features!
            </p>
            <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} gap-2`}>
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeDialog(false)}
                className={isMobile ? "w-full" : ""}
              >
                Cancel
              </Button>
              <Link to="/subscription" className={isMobile ? "w-full" : ""}>
                <Button className={isMobile ? "w-full" : ""}>Upgrade Now</Button>
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
        userData={userData}
      />
      <DashboardContent
        deals={deals}
        customFields={customFields}
        showCustomFields={showCustomFields}
        setShowCustomFields={setShowCustomFields}
        userData={userData}
        fetchDeals={fetchDeals}
      />
    </div>
  );
};

export default Dashboard;
