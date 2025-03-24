
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
import type { User, CustomField } from "@/types/types";

interface DashboardHeaderProps {
  onDealCreated: () => void;
  customFields: CustomField[];
  onBeforeCreate: () => Promise<boolean>;
  onSignOut: () => void;
  userData: User | null;
  onResetTour?: () => void;
  className?: string;
}

export function DashboardHeader({
  onDealCreated,
  customFields,
  onBeforeCreate,
  onSignOut,
  userData,
  onResetTour,
  className
}: DashboardHeaderProps) {
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const isMobile = useIsMobile();

  const handleCreateDeal = async () => {
    setIsCreatingDeal(true);
    try {
      const canCreate = await onBeforeCreate();
      if (canCreate) {
        onDealCreated();
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
          <HelpButton
            tooltipContent={
              <div>
                <p>Need help with your dashboard?</p>
                <ul className="list-disc pl-4 mt-1">
                  <li>Click "Create Deal" to add a new deal</li>
                  <li>Use filters to find specific deals</li>
                  <li>Click on any deal to view details</li>
                </ul>
                <p className="mt-1 text-xs">Click the help icon in the header to restart the tour</p>
              </div>
            }
          />
        )}
      </div>
    </MainHeader>
  );
}
