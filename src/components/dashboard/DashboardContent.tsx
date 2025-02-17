
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DealsTable } from "@/components/deals/DealsTable";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Deal, CustomField, User } from "@/types/types";

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
        <h1 className="text-2xl font-bold text-gray-900">Deal Dashboard</h1>
        <p className="text-sm text-gray-500">Manage and track your deals</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Switch
                id="custom-fields"
                checked={showCustomFields}
                onCheckedChange={setShowCustomFields}
              />
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-fields">Show Custom Fields</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Toggle to show or hide custom fields in the deals table. Custom fields allow you to track additional information specific to your deals.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {customFields.length} custom {customFields.length === 1 ? 'field' : 'fields'} available
            </div>
          </div>
        </CardContent>
      </Card>

      {userData?.subscription_status === 'free' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-yellow-800">
              Free plan: {deals.length}/{FREE_DEAL_LIMIT} deals used
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-yellow-800 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade to Pro for unlimited deals</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      
      <DealsTable 
        initialDeals={deals} 
        customFields={customFields}
        showCustomFields={showCustomFields}
      />
    </main>
  );
}
