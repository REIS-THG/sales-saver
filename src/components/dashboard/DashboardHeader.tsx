
import { MainHeader } from "@/components/layout/MainHeader";
import { CreateDealForm } from "@/components/deals/CreateDealForm";
import { BulkImportDeals } from "@/components/deals/BulkImportDeals";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  console.log('[DashboardHeader] Rendering with props:', {
    hasCustomFields: Array.isArray(customFields),
    customFieldsLength: customFields?.length,
    hasOnDealCreated: !!onDealCreated,
    hasOnBeforeCreate: !!onBeforeCreate
  });

  const handleDealCreated = () => {
    console.log('[DashboardHeader] Deal created callback triggered');
    try {
      onDealCreated();
    } catch (error) {
      console.error('[DashboardHeader] Error in onDealCreated callback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to handle deal creation callback"
      });
    }
  };

  return (
    <MainHeader onSignOut={onSignOut} userData={userData}>
      <div className="flex items-center gap-2">
        <CreateDealForm
          open={false}
          onClose={() => {
            console.log('[DashboardHeader] CreateDealForm close triggered');
          }}
          onSuccess={() => {
            console.log('[DashboardHeader] CreateDealForm success triggered');
            handleDealCreated();
          }}
          onBeforeCreate={onBeforeCreate}
          customFields={customFields}
          trigger={
            <Button className="shadow-sm" size={isMobile ? "sm" : "default"}>
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              <span className={isMobile ? "text-xs" : ""}>Create Deal</span>
            </Button>
          }
        />
        {userData?.subscription_status && (
          <BulkImportDeals 
            onImportComplete={handleDealCreated}
            trigger={
              <Button variant="outline" className="shadow-sm" size={isMobile ? "sm" : "default"}>
                <Upload className="mr-1 sm:mr-2 h-4 w-4" />
                <span className={isMobile ? "text-xs" : ""}>Import</span>
              </Button>
            }
          />
        )}
      </div>
    </MainHeader>
  );
}
