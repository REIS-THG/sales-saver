
import { useState } from "react";
import DealCreateModal from "@/components/deals/DealCreateModal";
import { DealAutomationSettings as DealAutomationSettings } from "@/components/dashboard/AutomationSettingsDialog";
import { QuickNoteModal as DealQuickNoteModal } from "@/components/dashboard/QuickNoteModal";
import type { Deal, CustomField, User, Team } from "@/types/types";

interface DashboardModalsProps {
  showCreateDealModal: boolean;
  onCloseCreateModal: () => void;
  onDealCreated: () => Promise<void>;
  onBeforeCreate: () => Promise<boolean>;
  customFields: CustomField[];
  showAutomationSettings: boolean;
  setShowAutomationSettings: (show: boolean) => void;
  userData: User | null;
  isQuickNoteModalOpen: boolean;
  setIsQuickNoteModalOpen: (open: boolean) => void;
  selectedDealId: string | null;
  selectedDeal: Deal | null;
  onNoteAdded: () => Promise<void>;
  currentTeam?: Team | null;
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
  onNoteAdded,
  currentTeam
}: DashboardModalsProps) {
  return (
    <>
      <DealCreateModal
        open={showCreateDealModal}
        onOpenChange={onCloseCreateModal}
        onDealCreated={onDealCreated}
        customFields={customFields}
        onBeforeCreate={onBeforeCreate}
        teamId={currentTeam?.id}
      />
      
      <DealAutomationSettings
        open={showAutomationSettings}
        onOpenChange={setShowAutomationSettings}
        userData={userData}
      />
      
      <DealQuickNoteModal
        open={isQuickNoteModalOpen}
        onOpenChange={setIsQuickNoteModalOpen}
        dealId={selectedDealId}
        deal={selectedDeal}
        onNoteAdded={onNoteAdded}
      />
    </>
  );
}
