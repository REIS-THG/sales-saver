
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";
import { SubscriptionStatus } from "@/types/types";
import { HelpButton } from "@/components/ui/help-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AnalysisSettingsProps {
  piiFilter: boolean;
  setPiiFilter: (value: boolean) => void;
  retainAnalysis: boolean;
  setRetainAnalysis: (value: boolean) => void;
  subscriptionTier: SubscriptionStatus;
}

export function AnalysisSettings({
  piiFilter,
  setPiiFilter,
  retainAnalysis,
  setRetainAnalysis,
  subscriptionTier
}: AnalysisSettingsProps) {
  return (
    <div className="p-6 border-b analysis-settings">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="pii-filter"
              checked={piiFilter}
              onCheckedChange={setPiiFilter}
            />
            <Label htmlFor="pii-filter" className="text-sm font-medium">
              PII Data Filter
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>PII filtering removes personal identifiable information from analysis for better privacy and compliance.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="retain-analysis"
              checked={retainAnalysis}
              onCheckedChange={setRetainAnalysis}
              disabled={subscriptionTier === 'free'}
            />
            <Label htmlFor="retain-analysis" className="text-sm font-medium">
              Retain Analysis History
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Save analysis results for future reference and comparison. Only available on Pro and Enterprise plans.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {subscriptionTier === 'free' && (
              <span className="text-xs text-gray-500 ml-2">
                Information used in analysis is not retained (Pro feature)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
