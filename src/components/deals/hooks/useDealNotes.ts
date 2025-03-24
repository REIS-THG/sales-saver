
import { useState } from "react";
import { DealNote, Deal } from "@/types/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDealNotes = (deal: Deal | null, onDealUpdated?: () => void) => {
  const [notes, setNotes] = useState<DealNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState<string>("");
  const { toast } = useToast();

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
      setAnalyzeStep("Reading note content...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalyzeStep("Analyzing sentiment...");
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setAnalyzeStep("Identifying key points...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAnalyzeStep("Generating recommendations...");
      
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
    } finally {
      setAnalyzeStep("");
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
      toast({
        title: "AI Analysis",
        description: "Analyzing your note content...",
      });
      
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

  return {
    notes,
    newNote,
    setNewNote,
    isLoading,
    isAnalyzing,
    analyzeStep,
    fetchNotes,
    handleAddNote
  };
};
