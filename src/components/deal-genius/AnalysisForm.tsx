
import { Button } from "@/components/ui/button";
import { DealSelector } from "./DealSelector";
import { AnalysisParameters } from "./AnalysisParameters";
import { useState } from "react";
import { Deal, Insight } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Loader2, Sparkles, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContextualHelp } from "@/components/ui/contextual-help";

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
  const isMobile = useIsMobile();
  
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
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium mb-2 block">Select Deal</label>
          
          <ContextualHelp
            id="analysis-form-help"
            title="How to analyze a deal"
            description={
              <ol className="list-decimal pl-4 text-sm space-y-2">
                <li>Select the deal you want to analyze</li>
                <li>Choose the sales approach that best fits your strategy</li>
                <li>Enter the industry to get contextual insights</li>
                <li>Add optional notes to guide the analysis</li>
                <li>Click "Analyze Deal" to start the AI analysis</li>
              </ol>
            }
            tooltipOnly={isMobile}
            initialShow={false}
          />
        </div>
        
        <DealSelector
          deals={deals}
          selectedDeal={selectedDeal}
          onDealChange={onDealChange}
        />

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
                size={isMobile ? "sm" : "default"}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {!isMobile ? "Analyzing Deal..." : "Analyzing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {!isMobile ? "Analyze Deal" : "Analyze"}
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLimited ? "Free plan limited to 1 analysis per month" : "Run AI analysis on the selected deal"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
