
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AICapabilitiesExplainerProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AICapabilitiesExplainer({ 
  isOpen = false, 
  onClose = () => {},
  open,
  onOpenChange
}: AICapabilitiesExplainerProps) {
  // For backward compatibility, support both prop styles
  const isDialogOpen = open !== undefined ? open : isOpen;
  const handleOpenChange = onOpenChange || ((isOpen: boolean) => {
    if (!isOpen) onClose();
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>AI Capabilities and Features</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Deal Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Our AI analyzes your sales conversations and deal data to identify key patterns, risks, and opportunities.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Risk assessment and opportunity highlighting</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Sentiment analysis of customer communications</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Deal health scoring based on multiple factors</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Content Generation</h3>
            <p className="text-sm text-muted-foreground">
              Generate professional follow-up messages, proposals, and other sales content automatically.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Personalized follow-up emails</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Objection handling templates</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Proposal outlines based on customer needs</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Coaching & Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Get personalized coaching and recommendations on your sales approach and strategy.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Sales technique suggestions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Pricing strategy recommendations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Timing and approach guidance</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Data Processing</h3>
            <p className="text-sm text-muted-foreground">
              Process and analyze various types of sales data to extract valuable insights.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Call transcript analysis</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Email correspondence review</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Document and proposal evaluation</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 border-t pt-4">
          <h3 className="font-medium mb-2">Privacy and Security</h3>
          <p className="text-sm text-muted-foreground">
            All data is processed securely, and we offer PII (Personally Identifiable Information) 
            filtering for Pro users to ensure compliance with privacy regulations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
