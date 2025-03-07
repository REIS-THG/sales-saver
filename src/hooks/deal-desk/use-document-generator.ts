
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Deal } from "@/types/types";

type DocumentType = 'sow' | 'contract' | 'invoice';

export function useDocumentGenerator(isProSubscription: boolean) {
  const [isGenerating, setIsGenerating] = useState<DocumentType | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (type: DocumentType, selectedDealId: string | null) => {
    if (!selectedDealId) {
      toast({
        title: "Select a Deal",
        description: "Please select a deal to generate the document.",
      });
      return;
    }

    if (!isProSubscription) {
      toast({
        variant: "destructive",
        title: "Pro Subscription Required",
        description: "This feature requires a Pro subscription. Please upgrade your plan to continue.",
      });
      return;
    }

    setIsGenerating(type);
    try {
      const { data: dealData, error: dealError } = await supabase
        .from('deals')
        .select('*')
        .eq('id', selectedDealId)
        .single();

      if (dealError) throw new Error("Failed to fetch deal details");

      // Call the appropriate edge function based on document type
      const response = await supabase.functions.invoke(`generate-${type}`, {
        body: { dealId: selectedDealId, dealData }
      });

      if (response.error) throw new Error(response.error.message);

      // Create and trigger download of document
      const documentContent = type === 'sow' 
        ? response.data.sow 
        : type === 'contract' 
          ? response.data.contract 
          : response.data.invoice;

      const filename = `${dealData.deal_name.replace(/\s+/g, '_')}_${type}.txt`;
      
      const blob = new Blob([documentContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${type.toUpperCase()} generated and downloaded successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate document",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return {
    isGenerating,
    handleGenerate
  };
}
