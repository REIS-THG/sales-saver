
import { useState } from "react";
import { 
  BarChart, 
  Bell, 
  Settings, 
  Plus, 
  ChevronDown,
  HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainHeader } from "@/components/layout/MainHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { HelpButton } from "@/components/ui/help-button";
import { ContextualHelp } from "@/components/ui/contextual-help";
import type { User, CustomField } from "@/types/types";

interface DashboardHeaderProps {
  onDealCreated: () => void;
  customFields: CustomField[];
  onBeforeCreate: () => Promise<boolean>;
  onSignOut: () => void;
  userData: User | null;
  onResetTour?: () => void;
  className?: string;
  setShowCreateDealModal: (show: boolean) => void;
}

export function DashboardHeader({
  onDealCreated,
  customFields,
  onBeforeCreate,
  onSignOut,
  userData,
  onResetTour,
  className,
  setShowCreateDealModal
}: DashboardHeaderProps) {
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const isMobile = useIsMobile();

  const handleCreateDeal = async () => {
    setIsCreatingDeal(true);
    try {
      const canCreate = await onBeforeCreate();
      if (canCreate) {
        setShowCreateDealModal(true);
      }
    } finally {
      setIsCreatingDeal(false);
    }
  };

  return (
    <MainHeader onSignOut={onSignOut} userData={userData} onResetTour={onResetTour} className={className}>
      <div className="flex items-center gap-2">
        {!isMobile && (
          <Button
            onClick={handleCreateDeal}
            disabled={isCreatingDeal}
            className="create-deal-button bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="mr-1 h-4 w-4" /> Create Deal
          </Button>
        )}
        
        {!isMobile && (
          <ContextualHelp
            id="dashboard-help"
            title="Dashboard Overview"
            description={
              <div className="space-y-2 text-sm">
                <p>Your dashboard helps you:</p>
                <ul className="list-disc pl-4">
                  <li>Track all your deals in one place</li>
                  <li>Create new deals and opportunities</li>
                  <li>Filter and sort to find what you need</li>
                  <li>Get insights about deal progress</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">Click the "Create Deal" button to add a new deal to your pipeline</p>
              </div>
            }
            initialShow={true}
          />
        )}
      </div>
    </MainHeader>
  );
}
