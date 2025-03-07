
import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal, Insight } from "@/types/types";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { DealCard } from "./components/DealCard";
import { AnalysisResultsCard } from "./components/AnalysisResultsCard";
import { SupportingDocumentsSection } from "./components/SupportingDocumentsSection";

interface DealAnalysisTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  isAnalyzing: boolean;
  isAnalysisLimited: boolean;
  onDealSelect: (dealId: string) => void;
  onAnalyze: (dealId: string) => void;
  onFileUpload: (file: File, type: 'transcript' | 'email' | 'voice' | 'audio') => void;
  insights?: Insight[];
  isLoading: boolean;
}

export function DealAnalysisTab({
  deals,
  selectedDeal,
  isAnalyzing,
  isAnalysisLimited,
  onDealSelect,
  onAnalyze,
  onFileUpload,
  insights = [],
  isLoading
}: DealAnalysisTabProps) {
  const selectedDealData = deals.find(deal => deal.id === selectedDeal);

  if (isLoading) {
    return <ReportsLoadingState />;
  }

  const dealInsights = insights.filter(insight => insight.deal_id === selectedDeal);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Deal</label>
        <Select value={selectedDeal || ''} onValueChange={onDealSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a deal to analyze" />
          </SelectTrigger>
          <SelectContent>
            {deals.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                {deal.deal_name} - {deal.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDealData && <DealCard deal={selectedDealData} />}
      
      <AnalysisResultsCard insights={dealInsights} />

      <SupportingDocumentsSection 
        onFileUpload={onFileUpload} 
        isAnalysisLimited={isAnalysisLimited} 
      />

      <Button 
        className="w-full"
        onClick={() => selectedDeal && onAnalyze(selectedDeal)}
        disabled={isAnalyzing || isAnalysisLimited || !selectedDeal}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {isAnalyzing ? 'Analyzing Deal...' : 'Analyze Deal'}
      </Button>
    </div>
  );
}
