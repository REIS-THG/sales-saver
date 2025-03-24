
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DealsTable } from "@/components/deals/DealsTable";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings2, ListFilter, InfoIcon } from "lucide-react";
import type { Deal, CustomField, User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardContentProps {
  deals: Deal[];
  customFields: CustomField[];
  showCustomFields: boolean;
  setShowCustomFields: (show: boolean) => void;
  userData: User | null;
  fetchDeals: () => Promise<void>;
}

const FREE_DEAL_LIMIT = 5;

export function DashboardContent({
  deals,
  customFields,
  showCustomFields,
  setShowCustomFields,
  userData,
  fetchDeals
}: DashboardContentProps) {
  const [selectedDeals, setSelectedDeals] = useState<Deal[]>([]);
  const isMobile = useIsMobile();

  const handleBulkAction = (action: 'won' | 'lost' | 'stalled' | 'delete') => {
    console.log(`Bulk action ${action} for deals:`, selectedDeals);
    // Handle bulk actions implementation
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      <div className="mb-3 sm:mb-5">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Deal Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage and track your deals</p>
      </div>

      {!userData?.subscription_status && (
        <Card className="mb-4 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-amber-800 dark:text-amber-200 font-medium text-sm sm:text-base">
                Free plan: {deals.length}/{FREE_DEAL_LIMIT} deals used
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Upgrade to Pro for unlimited deals
              </p>
            </div>
            <Link to="/subscription">
              <Button variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white shadow-sm w-full sm:w-auto mt-2 sm:mt-0">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-lg">
                  <Switch
                    id="custom-fields"
                    checked={showCustomFields}
                    onCheckedChange={setShowCustomFields}
                  />
                  <Label htmlFor="custom-fields" className="text-xs sm:text-sm cursor-pointer">
                    Custom Fields
                  </Label>
                  <InfoIcon className="h-3 w-3 text-gray-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side={isMobile ? "bottom" : "right"}>
                <p className="text-xs">Toggle to show or hide custom fields in the deals table</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {customFields.length > 0 && !isMobile && (
            <span className="text-xs text-gray-500 ml-2">
              {customFields.length} {customFields.length === 1 ? 'field' : 'fields'} available
            </span>
          )}
        </div>

        {selectedDeals.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            <span className="text-xs text-gray-500">
              {selectedDeals.length} {selectedDeals.length === 1 ? 'deal' : 'deals'} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListFilter className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">Bulk Actions</span>
                  <span className="xs:hidden">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-white dark:bg-gray-800">
                <DropdownMenuItem onClick={() => handleBulkAction('won')}>
                  Mark as Won
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('lost')}>
                  Mark as Lost
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('stalled')}>
                  Mark as Stalled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                  Delete Deals
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <DealsTable
        deals={deals}
        customFields={customFields}
        showCustomFields={showCustomFields}
        onSelectionChange={setSelectedDeals}
        fetchDeals={fetchDeals}
      />
    </main>
  );
}
