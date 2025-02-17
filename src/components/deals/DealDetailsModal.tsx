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
import { Spinner } from "@/components/ui/spinner";

interface DealDetailsModalProps {
  deal: Deal | null;
  onClose: () => void;
  onDealUpdated?: () => void;
}

const DealDetailsModal = ({ deal, onClose, onDealUpdated }: DealDetailsModalProps) => {
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState(deal?.status || "open");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const analyzeNote = async (content: string) => {
    try {
      const response = await fetch('/api/analyze-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteContent: content,
          dealContext: `Deal: ${deal?.deal_name}, Company: ${deal?.company_name}, Amount: ${deal?.amount}, Current Status: ${deal?.status}`
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      return await response.json();
    } catch (error) {
      console.error('Error analyzing note:', error);
      return null;
    }
  };

  const handleAddNote = async () => {
    if (!deal || !newNote.trim()) return;

    setIsLoading(true);
    setIsAnalyzing(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated.",
      });
      setIsLoading(false);
      setIsAnalyzing(false);
      return;
    }

    try {
      const analysis = await analyzeNote(newNote.trim());
      
      const { error: noteError } = await supabase
        .from("deal_notes")
        .insert({
          deal_id: deal.id,
          user_id: userId,
          content: newNote.trim(),
          sentiment_score: analysis?.sentiment_score,
          ai_analysis: analysis
        });

      if (noteError) throw noteError;

      if (analysis?.health_score) {
        const { error: dealError } = await supabase
          .from("deals")
          .update({ health_score: analysis.health_score })
          .eq("id", deal.id);

        if (dealError) throw dealError;
      }

      setNewNote("");
      fetchNotes();
      if (onDealUpdated) onDealUpdated();
      
      toast({
        title: "Success",
        description: "Note added and analyzed successfully.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add note. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
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
            <div className="flex items-center gap-4">
              <div className="text-sm">
                Health Score: 
                <span className={`ml-2 px-2 py-1 rounded ${
                  deal.health_score >= 70 ? 'bg-green-100 text-green-800' :
                  deal.health_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {deal.health_score}%
                </span>
              </div>
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
            </div>
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
                <Button 
                  onClick={handleAddNote} 
                  disabled={isLoading || !newNote.trim()}
                  className="flex items-center gap-2"
                >
                  {isAnalyzing && <Spinner size="sm" />}
                  Add Note
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600">{note.content}</p>
                    {note.sentiment_score !== null && (
                      <div className="mt-2 text-xs text-gray-500">
                        Sentiment: 
                        <span className={`ml-1 ${
                          note.sentiment_score > 30 ? 'text-green-600' :
                          note.sentiment_score < -30 ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {note.sentiment_score > 30 ? 'Positive' :
                           note.sentiment_score < -30 ? 'Negative' :
                           'Neutral'} ({note.sentiment_score})
                        </span>
                      </div>
                    )}
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
