
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DealsTable } from "@/components/deals/DealsTable";
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
      <div className="mb-4 flex items-center gap-2">
        <Switch
          id="custom-fields"
          checked={showCustomFields}
          onCheckedChange={setShowCustomFields}
        />
        <Label htmlFor="custom-fields">Show Custom Fields</Label>
      </div>
      {userData?.subscription_status === 'free' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            Free plan: {deals.length}/{FREE_DEAL_LIMIT} deals used
          </p>
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
