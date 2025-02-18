
import { MainHeader } from "@/components/layout/MainHeader";
import CreateDealForm from "@/components/deals/CreateDealForm";
import { BulkImportDeals } from "@/components/deals/BulkImportDeals";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center gap-2">
        <CreateDealForm
          onDealCreated={onDealCreated}
          customFields={customFields}
          onBeforeCreate={onBeforeCreate}
          trigger={
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          }
        />
        {userData?.subscription_status && (
          <BulkImportDeals 
            onImportComplete={onDealCreated}
            trigger={
              <Button variant="outline" className="shadow-sm">
                <Upload className="mr-2 h-4 w-4" />
                Import Deals
              </Button>
            }
          />
        )}
      </div>
    </MainHeader>
  );
}
