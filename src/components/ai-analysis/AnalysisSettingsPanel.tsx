
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AnalysisSettings } from "@/components/ai-analysis/AnalysisSettings";
import { SubscriptionStatus } from "@/types/types";

interface AnalysisSettingsPanelProps {
  piiFilter: boolean;
  setPiiFilter: (value: boolean) => void;
  retainAnalysis: boolean;
  setRetainAnalysis: (value: boolean) => void;
  subscriptionTier: SubscriptionStatus;
}

export function AnalysisSettingsPanel({
  piiFilter,
  setPiiFilter,
  retainAnalysis,
  setRetainAnalysis,
  subscriptionTier
}: AnalysisSettingsPanelProps) {
  return (
    <>
      <Separator />
      
      <AnalysisSettings
        piiFilter={piiFilter}
        setPiiFilter={setPiiFilter}
        retainAnalysis={retainAnalysis}
        setRetainAnalysis={setRetainAnalysis}
        subscriptionTier={subscriptionTier as 'free' | 'pro' | 'enterprise'}
      />
    </>
  );
}
