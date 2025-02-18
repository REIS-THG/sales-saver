
import { UserButton } from "@/components/dashboard/UserButton";
import CreateDealForm from "@/components/deals/CreateDealForm";
import { BulkImportDeals } from "@/components/deals/BulkImportDeals";
import type { CustomField, User } from "@/types/types";

interface DashboardHeaderProps {
  onDealCreated: () => void;
  customFields: CustomField[];
  onBeforeCreate?: () => Promise<boolean>;
  onSignOut?: () => void;
  userData?: User | null;
}

export function DashboardHeader({
  onDealCreated,
  customFields,
  onBeforeCreate,
  onSignOut,
  userData
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <CreateDealForm
              onDealCreated={onDealCreated}
              customFields={customFields}
              onBeforeCreate={onBeforeCreate}
            />
            {userData?.subscription_status === 'pro' && (
              <BulkImportDeals onImportComplete={onDealCreated} />
            )}
          </div>
          <UserButton onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
