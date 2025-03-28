
import { CreateDealForm } from "@/components/deals/CreateDealForm";
import { QuickNoteModal } from "@/components/dashboard/QuickNoteModal";
import { AutomationSettingsDialog } from "@/components/dashboard/AutomationSettingsDialog";
import type { Deal, User } from "@/types/types";

interface DashboardModalsProps {
  showCreateDealModal: boolean;
  onCloseCreateModal: () => void;
  onDealCreated: () => Promise<void>;
  onBeforeCreate: () => Promise<boolean>;
  customFields: any[];
  showAutomationSettings: boolean;
  setShowAutomationSettings: (show: boolean) => void;
  userData: User | null;
  isQuickNoteModalOpen: boolean;
  setIsQuickNoteModalOpen: (open: boolean) => void;
  selectedDealId: string | null;
  selectedDeal: Deal | null;
  onNoteAdded: () => Promise<void>;
}

export function DashboardModals({
  showCreateDealModal,
  onCloseCreateModal,
  onDealCreated,
  onBeforeCreate,
  customFields,
  showAutomationSettings,
  setShowAutomationSettings,
  userData,
  isQuickNoteModalOpen,
  setIsQuickNoteModalOpen,
  selectedDealId,
  selectedDeal,
  onNoteAdded
}: DashboardModalsProps) {
  return (
    <>
      {showCreateDealModal && (
        <CreateDealForm
          open={showCreateDealModal}
          onClose={onCloseCreateModal}
          onSuccess={onDealCreated}
          onBeforeCreate={onBeforeCreate}
          customFields={customFields}
          className="deal-form"
        />
      )}

      <QuickNoteModal
        deal={selectedDeal}
        isOpen={isQuickNoteModalOpen}
        onClose={() => setIsQuickNoteModalOpen(false)}
        onNoteAdded={onNoteAdded}
      />

      <AutomationSettingsDialog
        open={showAutomationSettings}
        onOpenChange={setShowAutomationSettings}
        userData={userData}
      />
    </>
  );
}
