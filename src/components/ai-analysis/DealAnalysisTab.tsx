
import { FileText, Mail, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Deal, Insight } from "@/types/types";

interface DealAnalysisTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  isAnalyzing: boolean;
  isAnalysisLimited: boolean;
  onDealSelect: (dealId: string) => void;
  onAnalyze: (dealId: string) => void;
  onFileUpload: (file: File, type: 'transcript' | 'email' | 'voice') => void;
}

export function DealAnalysisTab({
  deals,
  selectedDeal,
  isAnalyzing,
  isAnalysisLimited,
  onDealSelect,
  onAnalyze,
  onFileUpload,
}: DealAnalysisTabProps) {
  const selectedDealData = deals.find(deal => deal.id === selectedDeal);

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

      {selectedDealData && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedDealData.deal_name}</CardTitle>
            <CardDescription>
              Company: {selectedDealData.company_name} | Value: ${selectedDealData.amount.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Deal Status</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedDealData.status === 'won' ? 'bg-green-100 text-green-800' :
                    selectedDealData.status === 'lost' ? 'bg-red-100 text-red-800' :
                    selectedDealData.status === 'stalled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedDealData.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Health Score: {selectedDealData.health_score}%
                  </span>
                </div>
              </div>
              
              {selectedDealData.contact_first_name && (
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p className="text-sm text-gray-600">
                    {selectedDealData.contact_first_name} {selectedDealData.contact_last_name}
                    {selectedDealData.contact_email && (
                      <span className="block text-gray-500">{selectedDealData.contact_email}</span>
                    )}
                  </p>
                </div>
              )}

              {selectedDealData.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedDealData.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supporting Documents</CardTitle>
          <CardDescription>
            Upload supporting materials for better analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUploadCard
              icon={<FileText className="h-6 w-6" />}
              title="Call Transcripts"
              description="Upload call recordings or transcripts"
              accept=".txt,.doc,.docx,.pdf"
              onUpload={(file) => onFileUpload(file, 'transcript')}
              isDisabled={isAnalysisLimited}
            />
            <FileUploadCard
              icon={<Mail className="h-6 w-6" />}
              title="Email Threads"
              description="Upload email correspondence"
              accept=".eml,.msg,.txt"
              onUpload={(file) => onFileUpload(file, 'email')}
              isDisabled={isAnalysisLimited}
            />
            <FileUploadCard
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
}

interface FileUploadCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accept: string;
  onUpload: (file: File) => void;
  isDisabled?: boolean;
}

function FileUploadCard({
  icon,
  title,
  description,
  accept,
  onUpload,
  isDisabled = false,
}: FileUploadCardProps) {
  return (
    <Card className={`relative ${isDisabled ? 'opacity-50' : ''}`}>
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <label className={`block ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && !isDisabled) {
                onUpload(file);
              }
            }}
            disabled={isDisabled}
          />
          <Button variant="outline" className="w-full" disabled={isDisabled}>
            Choose File
          </Button>
        </label>
      </CardContent>
    </Card>
  );
}
