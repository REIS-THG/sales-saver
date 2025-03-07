
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DripCampaignMessagesProps {
  messages: string[];
  isLoading: boolean;
}

export function DripCampaignMessages({ messages, isLoading }: DripCampaignMessagesProps) {
  const { toast } = useToast();

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Copied to clipboard",
      description: "Message copied to clipboard successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="bg-muted/50">
            <CardContent className="p-4">
              <div className="h-4 w-24 bg-muted rounded mb-2"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded"></div>
                <div className="h-3 w-full bg-muted rounded"></div>
                <div className="h-3 w-3/4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <Card key={index} className="relative bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Message {index + 1} of 4
              </span>
            </div>
            <Textarea
              value={message}
              readOnly
              className="min-h-[100px] mb-2"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-1"
              onClick={() => handleCopyMessage(message)}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
