
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DealsTable } from "@/components/deals/DealsTable";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings2 } from "lucide-react";
import type { Deal, CustomField, User } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface DashboardContentProps {
  deals: Deal[];
  customFields: CustomField[];
  showCustomFields: boolean;
  setShowCustomFields: (show: boolean) => void;
  userData: User | null;
}

const FREE_DEAL_LIMIT = 5;

export function DashboardContent({
  deals,
  customFields,
  showCustomFields,
  setShowCustomFields,
  userData
}: DashboardContentProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deal Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your deals</p>
      </div>

      {userData?.subscription_status === 'free' && (
        <Card className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                Free plan: {deals.length}/{FREE_DEAL_LIMIT} deals used
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-300/80">
                Upgrade to Pro for unlimited deals and advanced features
              </p>
            </div>
            <Link to="/subscription">
              <Button 
                variant="default"
                className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white shadow-sm"
              >
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
                  <Switch
                    id="custom-fields"
                    checked={showCustomFields}
                    onCheckedChange={setShowCustomFields}
                  />
                  <Label htmlFor="custom-fields" className="text-sm cursor-pointer">
                    Custom Fields
                  </Label>
                  <Settings2 className="h-4 w-4 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle to show or hide custom fields in the deals table</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {customFields.length > 0 && (
            <span className="text-sm text-gray-500">
              {customFields.length} {customFields.length === 1 ? 'field' : 'fields'} available
            </span>
          )}
        </div>
      </div>
      
      <DealsTable 
        initialDeals={deals} 
        customFields={customFields}
        showCustomFields={showCustomFields}
      />
    </main>
  );
}
