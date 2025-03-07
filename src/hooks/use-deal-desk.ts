
import { useState } from "react";
import { useDealsFetcher } from "./deal-desk/use-deals-fetcher";
import { useDocumentGenerator } from "./deal-desk/use-document-generator";
import { useUserSubscription } from "./deal-desk/use-user-subscription";

export function useDealDesk() {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const { user, isProSubscription } = useUserSubscription();
  const { deals } = useDealsFetcher();
  const { isGenerating, handleGenerate } = useDocumentGenerator(isProSubscription);

  return {
    selectedDealId,
    setSelectedDealId,
    deals,
    isGenerating,
    isProSubscription,
    handleGenerate: (type: 'sow' | 'contract' | 'invoice', format: 'text' | 'docx' | 'pdf' = 'docx') => handleGenerate(type, selectedDealId, format)
  };
}
