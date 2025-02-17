
import { Button } from "@/components/ui/button";
import { DealSelector } from "./DealSelector";
import { AnalysisParameters } from "./AnalysisParameters";
import { ToneAnalysis } from "./ToneAnalysis";
import { CommunicationChannel } from "./CommunicationChannel";
import { useState } from "react";
import { Deal, Insight } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleAnalyze = () => {
    onAnalyze({
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
        <Button 
          onClick={handleAnalyze} 
          disabled={!selectedDeal || isAnalyzing}
          className="w-full flex items-center justify-center gap-2"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Deal"}
        </Button>
      </div>
    </div>
  );
}
