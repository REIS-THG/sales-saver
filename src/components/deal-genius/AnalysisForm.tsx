
import { Button } from "@/components/ui/button";
import { DealSelector } from "./DealSelector";
import { AnalysisParameters } from "./AnalysisParameters";
import { ToneAnalysis } from "./ToneAnalysis";
import { CommunicationChannel } from "./CommunicationChannel";
import { useState } from "react";
import { Deal, Insight } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface AnalysisFormProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealChange: (dealId: string) => void;
  isAnalyzing: boolean;
  isLoading?: boolean;
  onAnalyze: (params: {
    salesApproach: Insight['sales_approach'];
    industry: string;
    purposeNotes: string;
    toneAnalysis: {
      formality: number;
      persuasiveness: number;
      urgency: number;
    };
    communicationChannel: 'f2f' | 'email' | 'social_media';
  }) => void;
}

export function AnalysisForm({
  deals,
  selectedDeal,
  onDealChange,
  isAnalyzing,
  isLoading,
  onAnalyze,
}: AnalysisFormProps) {
  const [salesApproach, setSalesApproach] = useState<Insight['sales_approach']>('consultative_selling');
  const [industry, setIndustry] = useState('');
  const [purposeNotes, setPurposeNotes] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'f2f' | 'email' | 'social_media'>('email');
  const [formality, setFormality] = useState(50);
  const [persuasiveness, setPersuasiveness] = useState(50);
  const [urgency, setUrgency] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Simulated progress during analysis
  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

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
    const stopProgress = startProgress();

    try {
      await onAnalyze({
        salesApproach,
        industry,
        purposeNotes,
        toneAnalysis: {
          formality,
          persuasiveness,
          urgency,
        },
        communicationChannel: selectedChannel,
      });
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze deal. Please try again.");
    } finally {
      stopProgress();
    }
  };

  const handleRetry = () => {
    setError(null);
    handleAnalyze();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="ml-4"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Analysis
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Try analyzing the deal again</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </AlertDescription>
        </Alert>
      )}

      {isAnalyzing && (
        <div className="mb-4 space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Analyzing deal... {progress}%
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
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

        <ToneAnalysis
          formality={formality}
          setFormality={setFormality}
          persuasiveness={persuasiveness}
          setPersuasiveness={setPersuasiveness}
          urgency={urgency}
          setUrgency={setUrgency}
        />

        <div>
          <CommunicationChannel
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
          />
        </div>

        <div className="md:col-span-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!selectedDeal || isAnalyzing}
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
    </div>
  );
}
