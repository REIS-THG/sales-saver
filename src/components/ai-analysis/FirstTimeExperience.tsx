
import { ExampleAnalyses } from "@/components/ai-analysis/ExampleAnalyses";
import { AICapabilitiesExplainer } from "@/components/ai-analysis/AICapabilitiesExplainer";

interface FirstTimeExperienceProps {
  isFirstVisit: boolean;
  isAnalyzing: boolean;
  onTryNow: () => void;
}

export function FirstTimeExperience({ 
  isFirstVisit, 
  isAnalyzing,
  onTryNow 
}: FirstTimeExperienceProps) {
  return (
    <>
      {/* AI Capabilities Explainer - always visible */}
      <AICapabilitiesExplainer />

      {/* First-time user experience */}
      {isFirstVisit && !isAnalyzing && (
        <ExampleAnalyses onTryNow={onTryNow} />
      )}
    </>
  );
}
