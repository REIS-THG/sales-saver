
import { useEffect, useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AutomationSettings, AutomationSettingsDialog } from "@/components/dashboard/AutomationSettingsDialog";
import { QuickNoteModal } from "@/components/dashboard/QuickNoteModal";
import { Deal } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";

const FREE_DEAL_LIMIT = 5;

// Default automation settings
const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  enableTimeDecay: false,
  timeDecayRate: 5,
  enableActivityBoost: true,
  activityBoostRate: 5,
  enableAutoStatusChange: false,
};

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
  
  const [automationSettings, setAutomationSettings] = useState<AutomationSettings>(DEFAULT_AUTOMATION_SETTINGS);
  const [quickNoteModalOpen, setQuickNoteModalOpen] = useState(false);
  const [selectedDealForNote, setSelectedDealForNote] = useState<Deal | null>(null);
  
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      fetchDeals();
      fetchCustomFields();
      
      // Load automation settings from user data if available
      if (userData.deal_automation_settings) {
        setAutomationSettings(userData.deal_automation_settings as AutomationSettings);
      }
    }
  }, [userData]);

  const handleCreateDeal = async () => {
    if (!userData?.subscription_status && deals.length >= FREE_DEAL_LIMIT) {
      setShowUpgradeDialog(true);
      return false;
    }
    return true;
  };
  
  const handleQuickNote = (deal: Deal) => {
    setSelectedDealForNote(deal);
    setQuickNoteModalOpen(true);
  };

  if (loading && !deals.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  if (error && !deals.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Error loading dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={fetchDeals} 
            variant="outline" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </>
            )}
          </Button>
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
      >
        {userData && (
          <AutomationSettingsDialog 
            userId={userData.user_id} 
            settings={automationSettings}
            onSettingsChange={setAutomationSettings}
          />
        )}
      </DashboardHeader>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <DashboardWidgets 
          deals={deals} 
          userData={userData}
          loading={loading}
          error={error}
        />
        
        <DashboardContent
          deals={deals}
          customFields={customFields}
          showCustomFields={showCustomFields}
          setShowCustomFields={setShowCustomFields}
          userData={userData}
          fetchDeals={fetchDeals}
          onQuickNote={handleQuickNote}
        />
      </div>
      
      <QuickNoteModal
        deal={selectedDealForNote}
        isOpen={quickNoteModalOpen}
        onClose={() => setQuickNoteModalOpen(false)}
        onNoteAdded={fetchDeals}
      />
    </div>
  );
};

export default Dashboard;
