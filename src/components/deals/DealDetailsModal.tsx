
import { useEffect } from "react";
import { type Deal, type CustomField } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { useDealNotes } from "./hooks/useDealNotes";
import { useDealStatus } from "./hooks/useDealStatus";
import { DealModalHeader } from "./components/DealModalHeader";
import { DealInfoSection } from "./components/DealInfoSection";
import { DealNotesSection } from "./components/DealNotesSection";

interface DealDetailsModalProps {
  deal: Deal | null;
  onClose: () => void;
  onDealUpdated?: () => void;
  customFields: CustomField[];
}

const DealDetailsModal = ({ deal, onClose, onDealUpdated, customFields }: DealDetailsModalProps) => {
  const { 
    notes, 
    newNote, 
    setNewNote, 
    isLoading, 
    isAnalyzing, 
    fetchNotes, 
    handleAddNote 
  } = useDealNotes(deal, onDealUpdated);
  
  const { 
    status, 
    setStatus, 
    isStatusUpdating, 
    handleStatusChange 
  } = useDealStatus(deal, onDealUpdated);

  useEffect(() => {
    if (deal) {
      fetchNotes();
      setStatus(deal.status);
    }
  }, [deal, fetchNotes, setStatus]);

  if (!deal) return null;

  return (
    <Dialog open={!!deal} onOpenChange={() => onClose()}>
      <DialogContent 
        className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto"
        aria-describedby="deal-details-content"
      >
        <div id="deal-details-content" className="sr-only">
          Deal details and history for {deal?.deal_name}
        </div>
        <DialogHeader className="space-y-4">
          <DealModalHeader 
            deal={deal}
            status={status}
            isStatusUpdating={isStatusUpdating}
            onStatusChange={handleStatusChange}
          />
        </DialogHeader>

        <DealInfoSection deal={deal} />
        
        <DealNotesSection 
          notes={notes}
          newNote={newNote}
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
          onNoteChange={setNewNote}
          onAddNote={handleAddNote}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailsModal;
