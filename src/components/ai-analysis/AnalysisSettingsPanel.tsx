
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AnalysisSettings } from "@/components/ai-analysis/AnalysisSettings";
import { SubscriptionStatus } from "@/types/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AnalysisSettingsPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  piiFilter?: boolean;
  setPiiFilter?: (value: boolean) => void;
  retainAnalysis?: boolean;
  setRetainAnalysis?: (value: boolean) => void;
  subscriptionTier?: SubscriptionStatus;
}

export function AnalysisSettingsPanel({
  open = false,
  onOpenChange = () => {},
  piiFilter = false,
  setPiiFilter = () => {},
  retainAnalysis = true,
  setRetainAnalysis = () => {},
  subscriptionTier = 'free'
}: AnalysisSettingsPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Analysis Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <AnalysisSettings
            piiFilter={piiFilter}
            setPiiFilter={setPiiFilter}
            retainAnalysis={retainAnalysis}
            setRetainAnalysis={setRetainAnalysis}
            subscriptionTier={subscriptionTier}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
