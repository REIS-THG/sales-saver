
import { useState, useEffect } from "react";
import { type Deal, type DealNote } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DealDetailsModalProps {
  deal: Deal | null;
  onClose: () => void;
  onDealUpdated?: () => void;
}

const DealDetailsModal = ({ deal, onClose, onDealUpdated }: DealDetailsModalProps) => {
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState(deal?.status || "open");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (deal) {
      fetchNotes();
      setStatus(deal.status);
    }
  }, [deal]);

  const fetchNotes = async () => {
    if (!deal) return;

    const { data, error } = await supabase
      .from("deal_notes")
      .select("*")
      .eq("deal_id", deal.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
      return;
    }

    setNotes(data as DealNote[]);
  };

  const handleAddNote = async () => {
    if (!deal || !newNote.trim()) return;

    setIsLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated.",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from("deal_notes")
      .insert({
        deal_id: deal.id,
        user_id: userId,
        content: newNote.trim(),
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note. Please try again.",
      });
      console.error("Error adding note:", error);
    } else {
      setNewNote("");
      fetchNotes();
      if (onDealUpdated) onDealUpdated();
      toast({
        title: "Success",
        description: "Note added successfully.",
      });
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!deal) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("deals")
      .update({ status: newStatus })
      .eq("id", deal.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status. Please try again.",
      });
      console.error("Error updating status:", error);
    } else {
      setStatus(newStatus as Deal["status"]);
      if (onDealUpdated) onDealUpdated();
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }
    setIsLoading(false);
  };

  if (!deal) return null;

  return (
    <Dialog open={!!deal} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{deal.deal_name}</span>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="stalled">Stalled</SelectItem>
              </SelectContent>
            </Select>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="font-medium">{deal.company_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium">
              ${Number(deal.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact</p>
            <p className="font-medium">{`${deal.contact_first_name} ${deal.contact_last_name}`}</p>
            <p className="text-sm text-gray-500">{deal.contact_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dates</p>
            <p className="font-medium">
              Start: {new Date(deal.start_date).toLocaleDateString()}
            </p>
            {deal.expected_close_date && (
              <p className="font-medium">
                Expected Close: {new Date(deal.expected_close_date).toLocaleDateString()}
              </p>
            )}
          </div>
          {deal.next_action && (
            <div>
              <p className="text-sm text-gray-500">Next Action</p>
              <p className="font-medium">{deal.next_action}</p>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Notes</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={isLoading || !newNote.trim()}>
                  Add Note
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(note.created_at), "PPp")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DealDetailsModal;
