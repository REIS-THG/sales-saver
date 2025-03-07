
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DripCampaignMessages } from "./DripCampaignMessages";

interface MessageGeneratorProps {
  dealId: string | null;
  generateDripCampaign: boolean;
}

export function MessageGenerator({ dealId, generateDripCampaign }: MessageGeneratorProps) {
  const [communicationType, setCommunicationType] = useState<string>('email');
  const [formality, setFormality] = useState<number[]>([50]);
  const [persuasiveness, setPersuasiveness] = useState<number[]>([50]);
  const [urgency, setUrgency] = useState<number[]>([50]);
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [dripCampaignMessages, setDripCampaignMessages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    setGeneratedMessage('');
    setDripCampaignMessages([]);
    
    try {
      const response = await supabase.functions.invoke('generate-message', {
        body: {
          dealId,
          communicationType,
          toneSettings: {
            formality: formality[0],
            persuasiveness: persuasiveness[0],
            urgency: urgency[0]
          },
          isDripCampaign: generateDripCampaign
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (generateDripCampaign) {
        setDripCampaignMessages(response.data.messages || []);
      } else {
        setGeneratedMessage(response.data.message || '');
      }
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Generate {generateDripCampaign ? 'Drip Campaign' : 'Communication'}
        </CardTitle>
        <CardDescription>
          {generateDripCampaign 
            ? 'Customize and generate a series of follow-up messages' 
            : 'Customize and generate a message based on the analysis'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Communication Type</label>
            <Select value={communicationType} onValueChange={setCommunicationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select communication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="message">Direct Message</SelectItem>
                <SelectItem value="call_script">Call Script</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Formality</label>
              <Slider
                value={formality}
                onValueChange={setFormality}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Persuasiveness</label>
              <Slider
                value={persuasiveness}
                onValueChange={setPersuasiveness}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency</label>
              <Slider
                value={urgency}
                onValueChange={setUrgency}
                max={100}
                step={1}
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerateMessage}
            disabled={isGenerating || !dealId}
          >
            <Send className="h-4 w-4 mr-2" />
            {isGenerating 
              ? 'Generating...' 
              : `Generate ${generateDripCampaign ? 'Drip Campaign' : 'Message'}`}
          </Button>
        </div>

        {generateDripCampaign ? (
          <DripCampaignMessages 
            messages={dripCampaignMessages} 
            isLoading={isGenerating} 
          />
        ) : (
          generatedMessage && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Generated Message</label>
              <Textarea
                value={generatedMessage}
                readOnly
                className="min-h-[200px]"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigator.clipboard.writeText(generatedMessage)}
              >
                Copy to Clipboard
              </Button>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
