
import { useState, useEffect } from "react";
import { type Deal, type DealNote, type CustomField } from "@/types/types";
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
import { Loader2, MessageSquare, Bot, Activity } from "lucide-react";

interface DealDetailsModalProps {
  deal: Deal | null;
  onClose: () => void;
  onDealUpdated?: () => void;
  customFields: CustomField[];
}

const DealDetailsModal = ({ deal, onClose, onDealUpdated, customFields }: DealDetailsModalProps) => {
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState(deal?.status || "open");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
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
      const { data, error } = await supabase.functions.invoke('analyze-note', {
        body: {
          noteContent: content,
          dealContext: `Deal: ${deal?.deal_name}, Company: ${deal?.company_name}, Amount: ${deal?.amount}, Current Status: ${deal?.status}`
        }
      });

      if (error) throw error;
      return data;
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

    setIsStatusUpdating(true);
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
    setIsStatusUpdating(false);
  };

  const renderAIAnalysis = (analysis: any) => {
    if (!analysis) return null;

    return (
      <div className="mt-2 space-y-2 bg-slate-50 p-3 rounded-md">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Bot className="h-4 w-4" />
          <span className="font-medium">AI Analysis</span>
        </div>
        {analysis.next_actions && (
          <div className="pl-6">
            <p className="text-sm font-medium text-slate-700">Recommended Next Actions:</p>
            <ul className="list-disc pl-4 text-sm text-slate-600">
              {typeof analysis.next_actions === 'string' 
                ? <li>{analysis.next_actions}</li>
                : analysis.next_actions.map((action: string, i: number) => (
                    <li key={i}>{action}</li>
                  ))
              }
            </ul>
          </div>
        )}
        {analysis.key_points && (
          <div className="pl-6">
            <p className="text-sm font-medium text-slate-700">Key Points:</p>
            <ul className="list-disc pl-4 text-sm text-slate-600">
              {typeof analysis.key_points === 'string'
                ? <li>{analysis.key_points}</li>
                : analysis.key_points.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))
              }
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!deal) return null;

  return (
    <Dialog open={!!deal} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-xl font-semibold break-all">{deal?.deal_name}</span>
            <div className="flex items-center gap-4 sm:ml-auto">
              <div className="text-sm whitespace-nowrap">
                Health Score: 
                <span className={`ml-2 px-2 py-1 rounded ${
                  deal?.health_score >= 70 ? 'bg-green-100 text-green-800' :
                  deal?.health_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {deal?.health_score}%
                </span>
              </div>
              <Select value={status} onValueChange={handleStatusChange} disabled={isStatusUpdating}>
                <SelectTrigger className="w-[120px]">
                  {isStatusUpdating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <SelectValue />
                  )}
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

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium break-all">{deal?.company_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-medium">
                ${Number(deal?.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium break-all">{`${deal?.contact_first_name} ${deal?.contact_last_name}`}</p>
              <p className="text-sm text-gray-500 break-all">{deal?.contact_email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Dates</p>
              <p className="font-medium">
                Start: {deal?.start_date ? new Date(deal.start_date).toLocaleDateString() : 'N/A'}
              </p>
              {deal?.expected_close_date && (
                <p className="font-medium">
                  Expected Close: {new Date(deal.expected_close_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {deal?.next_action && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Next Action</p>
              <p className="font-medium break-all">{deal.next_action}</p>
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes & Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 min-h-[80px]"
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={isLoading || !newNote.trim()}
                  className="sm:self-start whitespace-nowrap"
                >
                  {isAnalyzing && <Spinner size="sm" />}
                  Add Note
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-md space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Activity className="h-4 w-4" />
                      <span>{format(new Date(note.created_at), "PPp")}</span>
                    </div>
                    <p className="text-sm text-gray-600 break-words">{note.content}</p>
                    {note.sentiment_score !== null && (
                      <div className="text-xs text-gray-500">
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
                    {note.ai_analysis && renderAIAnalysis(note.ai_analysis)}
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
