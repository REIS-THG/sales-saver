
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Deal } from "@/types/types";

type DocumentType = 'sow' | 'contract' | 'invoice';
type DocumentFormat = 'text' | 'docx' | 'pdf';

export function useDocumentGenerator(isProSubscription: boolean) {
  const [isGenerating, setIsGenerating] = useState<DocumentType | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (type: DocumentType, selectedDealId: string | null, format: DocumentFormat = 'docx') => {
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
        body: { dealId: selectedDealId, dealData, format }
      });

      if (response.error) throw new Error(response.error.message);

      // Handle different document formats
      if (format === 'docx') {
        // For DOCX, we get back base64 encoded file
        const filename = response.data.filename;
        const contentType = response.data.mimeType;
        const documentContent = type === 'sow' 
          ? response.data.sow 
          : type === 'contract' 
            ? response.data.contract 
            : response.data.invoice;
        
        // Decode the base64 content and create a blob
        const byteCharacters = atob(documentContent);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: contentType });
        const url = URL.createObjectURL(blob);
        
        // Create download link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Handle plain text as before
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
      }

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
