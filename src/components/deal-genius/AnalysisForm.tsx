
import { Button } from "@/components/ui/button";
import { DealSelector } from "./DealSelector";
import { AnalysisParameters } from "./AnalysisParameters";
import { useState } from "react";
import { Deal, Insight } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Loader2, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnalysisFormProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealChange: (dealId: string) => void;
  isAnalyzing: boolean;
  isLoading?: boolean;
  isLimited?: boolean;
  onAnalyze: (params: {
    salesApproach: Insight['sales_approach'];
    industry: string;
    purposeNotes: string;
  }) => void;
}

export function AnalysisForm({
  deals,
  selectedDeal,
  onDealChange,
  isAnalyzing,
  isLoading,
  isLimited,
  onAnalyze,
}: AnalysisFormProps) {
  const [salesApproach, setSalesApproach] = useState<Insight['sales_approach']>('consultative_selling');
  const [industry, setIndustry] = useState('');
  const [purposeNotes, setPurposeNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedDeal) {
      setError("Please select a deal to analyze");
      return;
    }

    if (!industry.trim()) {
      setError("Please specify the industry");
      return;
    }

    setError(null);
    onAnalyze({
      salesApproach,
      industry,
      purposeNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Deal</label>
          <DealSelector
            deals={deals}
            selectedDeal={selectedDeal}
            onDealChange={onDealChange}
          />
        </div>

        <AnalysisParameters
          salesApproach={salesApproach}
          setSalesApproach={setSalesApproach}
          industry={industry}
          setIndustry={setIndustry}
          purposeNotes={purposeNotes}
          setPurposeNotes={setPurposeNotes}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleAnalyze} 
                disabled={!selectedDeal || isAnalyzing || isLimited}
                className="w-full flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Deal...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Deal
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Run AI analysis on the selected deal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
