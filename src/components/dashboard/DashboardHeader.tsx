
import { MainHeader } from "@/components/layout/MainHeader";
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
    <MainHeader onSignOut={onSignOut} userData={userData}>
      <div className="flex items-center space-x-2">
        <CreateDealForm
          onDealCreated={onDealCreated}
          customFields={customFields}
          onBeforeCreate={onBeforeCreate}
        />
        {userData?.subscription_status === 'pro' && (
          <BulkImportDeals onImportComplete={onDealCreated} />
        )}
      </div>
    </MainHeader>
  );
}
