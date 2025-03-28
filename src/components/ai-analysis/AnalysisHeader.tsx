
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Sparkles, Lock } from "lucide-react";
import { ContextualHelp } from "@/components/ui/contextual-help";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnalysisHeaderProps {
  subscriptionTier: string;
}

export function AnalysisHeader({ subscriptionTier }: AnalysisHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 analysis-header">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold tracking-tight`}>
            AI Analysis
          </h1>
          {subscriptionTier === "free" ? (
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
              <Lock className="h-3 w-3 mr-1" />
              Limited
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs border-green-500 text-green-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <p className={`text-muted-foreground ${isMobile ? "text-sm" : ""}`}>
          Analyze your deals with AI to get insights and recommendations
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <ContextualHelp
          id="ai-analysis-intro"
          title="Using AI Analysis"
          description={
            <div className="space-y-2 text-sm">
              <p>AI Analysis helps you:</p>
              <ul className="list-disc pl-4">
                <li>Identify potential issues in your deals</li>
                <li>Get personalized recommendations</li>
                <li>Generate follow-up messages</li>
                <li>Analyze sales documents and communications</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">Free accounts are limited to 1 analysis per month</p>
            </div>
          }
          initialShow={true}
        />
      </div>
    </div>
  );
}
