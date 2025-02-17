
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Deal, Insight } from "@/types/types";
import { DealSelector } from "./DealSelector";
import { AnalysisParameters } from "./AnalysisParameters";
import { ToneAnalysis } from "./ToneAnalysis";
import { CommunicationChannel } from "./CommunicationChannel";

interface AnalysisFormProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealChange: (dealId: string) => void;
  isAnalyzing: boolean;
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
          {isAnalyzing && <Spinner size="sm" />}
          Analyze Deal
        </Button>
      </div>
    </div>
  );
}
