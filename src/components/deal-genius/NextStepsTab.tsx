
import { ListChecks, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DealSelector } from "@/components/deal-genius/DealSelector";
import { ToneAnalysis } from "@/components/deal-genius/ToneAnalysis";
import { CommunicationChannel } from "@/components/deal-genius/CommunicationChannel";
import { Deal } from "@/types/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface NextStepsTabProps {
  deals: Deal[];
  selectedDeal: string | null;
  onDealSelect: (dealId: string) => void;
}

export const NextStepsTab = ({
  deals,
  selectedDeal,
  onDealSelect,
}: NextStepsTabProps) => {
  const { toast } = useToast();
  const [formality, setFormality] = useState(50);
  const [persuasiveness, setPersuasiveness] = useState(50);
  const [urgency, setUrgency] = useState(50);
  const [selectedChannel, setSelectedChannel] = useState<'f2f' | 'email' | 'social_media'>('email');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState<string>("");

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftContent);
    toast({
      title: "Copied to clipboard",
      description: "The draft has been copied to your clipboard.",
    });
  };

  const handleCreateDraft = async () => {
    setIsGeneratingDraft(true);
    setDraftContent("");
    
    // Simulate AI generating a draft based on settings
    setTimeout(() => {
      const draft = `Dear [Contact],

I hope this ${selectedChannel === 'email' ? 'email' : 'message'} finds you well.

[AI-generated content based on:
- Formality: ${formality}%
- Persuasiveness: ${persuasiveness}%
- Urgency: ${urgency}%
- Channel: ${selectedChannel}]

Best regards,
[Your name]`;
      
      setDraftContent(draft);
      setIsGeneratingDraft(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
        <CardDescription>
          Generate communication drafts based on your preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Deal
          </label>
          <DealSelector
            deals={deals}
            selectedDeal={selectedDeal}
            onDealChange={onDealSelect}
          />
        </div>

        <div className="mt-6">
          <ToneAnalysis
            formality={formality}
            setFormality={setFormality}
            persuasiveness={persuasiveness}
            setPersuasiveness={setPersuasiveness}
            urgency={urgency}
            setUrgency={setUrgency}
          />
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium mb-2 block">
            Communication Channel
          </label>
          <CommunicationChannel
            selectedChannel={selectedChannel}
            setSelectedChannel={setSelectedChannel}
          />
        </div>

        <Button 
          className="w-full mt-6"
          onClick={handleCreateDraft}
          disabled={isGeneratingDraft || !selectedDeal}
        >
          <ListChecks className="w-4 h-4 mr-2" />
          {isGeneratingDraft ? 'Generating Draft...' : 'Generate Communication Draft'}
        </Button>

        {draftContent && (
          <div className="mt-6">
            <div className="relative">
              <pre className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                {draftContent}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={handleCopyDraft}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
