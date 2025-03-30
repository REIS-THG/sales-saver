
import * as React from "react";
import { Deal } from "@/types/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QuickNoteModalProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string | null;
  onNoteAdded: () => void;
}

export function QuickNoteModal({
  deal,
  open,
  onOpenChange,
  dealId,
  onNoteAdded,
}: QuickNoteModalProps) {
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setNote("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!deal || !note.trim()) return;

    setIsSubmitting(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    try {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("deal_notes")
        .insert({
          deal_id: deal.id,
          user_id: userId,
          content: note.trim(),
        });

      if (error) throw error;

      toast({
        title: "Note added",
        description: "Your note has been added successfully",
      });
      
      onNoteAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!deal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note to {deal.deal_name}</DialogTitle>
          <DialogDescription>
            Quickly add a note to this deal to track important information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Textarea
            placeholder="Enter your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !note.trim()}
          >
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
            {isSubmitting ? "Adding Note..." : "Add Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
