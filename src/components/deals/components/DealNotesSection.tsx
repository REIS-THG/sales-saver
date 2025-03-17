
import { format } from "date-fns";
import { MessageSquare, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { DealNote } from "@/types/types";
import { NoteAnalysis } from "./NoteAnalysis";

interface DealNotesSectionProps {
  notes: DealNote[];
  newNote: string;
  isLoading: boolean;
  isAnalyzing: boolean;
  onNoteChange: (value: string) => void;
  onAddNote: () => void;
}

export const DealNotesSection = ({
  notes,
  newNote,
  isLoading,
  isAnalyzing,
  onNoteChange,
  onAddNote
}: DealNotesSectionProps) => {
  return (
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
            onChange={(e) => onNoteChange(e.target.value)}
            className="flex-1 min-h-[80px]"
          />
          <Button 
            onClick={onAddNote} 
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
              {note.ai_analysis && <NoteAnalysis analysis={note.ai_analysis} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
