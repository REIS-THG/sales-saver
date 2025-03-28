
import { AILoadingState } from "@/components/ai-analysis/AILoadingState";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { MainHeader } from "@/components/layout/MainHeader";
import { User } from "@/types/types";

interface AnalysisLoadingStatesProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  user: User | null;
  selectedDeal: string | null;
  deals: Deal[];
}

interface Deal {
  id: string;
  deal_name: string;
}

export function AnalysisLoadingStates({ 
  isLoading, 
  isAnalyzing, 
  user, 
  selectedDeal,
  deals
}: AnalysisLoadingStatesProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainHeader userData={user} />
        <ReportsLoadingState />
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <AILoadingState 
        message={selectedDeal ? `Analyzing ${deals.find(d => d.id === selectedDeal)?.deal_name || 'deal'}...` : "Analyzing data..."} 
      />
    );
  }

  return null;
}
