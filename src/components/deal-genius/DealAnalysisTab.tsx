
import { FileText, Mail, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploader } from "@/components/deal-genius/FileUploader";
import { DealSelector } from "@/components/deal-genius/DealSelector";
import { Deal } from "@/types/types";

interface DealAnalysisTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  isAnalyzing: boolean;
  isAnalysisLimited: boolean;
  onDealSelect: (dealId: string) => void;
  onAnalyze: (dealId: string) => void;
  onFileUpload: (file: File, type: 'transcript' | 'email' | 'voice') => void;
}

export const DealAnalysisTab = ({
  deals,
  selectedDeal,
  isAnalyzing,
  isAnalysisLimited,
  onDealSelect,
  onAnalyze,
  onFileUpload,
}: DealAnalysisTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Select Deal</label>
        <DealSelector
          deals={deals}
          selectedDeal={selectedDeal}
          onDealChange={onDealSelect}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload supporting materials for better analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUploader
              icon={<FileText className="h-6 w-6" />}
              title="Call Transcripts"
              description="Upload call recordings or transcripts"
              accept=".txt,.doc,.docx,.pdf"
              onUpload={(file) => onFileUpload(file, 'transcript')}
              isDisabled={isAnalysisLimited}
            />
            <FileUploader
              icon={<Mail className="h-6 w-6" />}
              title="Email Threads"
              description="Upload email correspondence"
              accept=".eml,.msg,.txt"
              onUpload={(file) => onFileUpload(file, 'email')}
              isDisabled={isAnalysisLimited}
            />
            <FileUploader
              icon={<Mic className="h-6 w-6" />}
              title="Voice Recordings"
              description="Upload voice notes or calls"
              accept=".mp3,.wav,.m4a"
              onUpload={(file) => onFileUpload(file, 'voice')}
              isDisabled={isAnalysisLimited}
            />
          </div>
        </CardContent>
      </Card>

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
};
