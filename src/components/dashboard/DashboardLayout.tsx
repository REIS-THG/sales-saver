
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApiError } from "@/hooks/use-api-error";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { HelpButton } from "@/components/ui/help-button";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { useTour } from "@/hooks/use-tour";
import type { User } from "@/types/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
  userData: User | null;
  onSignOut: () => Promise<void>;
  onDealCreated: () => Promise<void>;
  customFields: any[];
  onBeforeCreate: () => Promise<boolean>;
  showCreateDealModal: boolean;
  setShowCreateDealModal: (show: boolean) => void;
  resetTour: () => void;
}

export function DashboardLayout({
  children,
  isLoading,
  userData,
  onSignOut,
  onDealCreated,
  customFields,
  onBeforeCreate,
  showCreateDealModal,
  setShowCreateDealModal,
  resetTour
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return <ReportsLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        onDealCreated={() => setShowCreateDealModal(true)}
        customFields={customFields}
        onBeforeCreate={onBeforeCreate}
        onSignOut={onSignOut}
        userData={userData}
        onResetTour={resetTour}
        className="dashboard-header"
      />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {isMobile && (
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

        {children}
      </main>
    </div>
  );
}
