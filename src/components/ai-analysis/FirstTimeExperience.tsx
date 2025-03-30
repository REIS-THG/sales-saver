
import { ExampleAnalyses } from "@/components/ai-analysis/ExampleAnalyses";
import { AICapabilitiesExplainer } from "@/components/ai-analysis/AICapabilitiesExplainer";

interface FirstTimeExperienceProps {
  onComplete: () => void;
  isFirstVisit?: boolean;
  isAnalyzing?: boolean;
  onTryNow?: () => void;
}

export function FirstTimeExperience({ 
  onComplete,
  isFirstVisit = true, 
  isAnalyzing = false,
  onTryNow = () => {}
}: FirstTimeExperienceProps) {
  return (
    <>
      {/* AI Capabilities Explainer - always visible */}
      <AICapabilitiesExplainer />

      {/* First-time user experience */}
      {isFirstVisit && !isAnalyzing && (
        <ExampleAnalyses onTryNow={onTryNow} />
      )}

      <div className="mt-6 text-center">
        <button 
          onClick={onComplete}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Get Started
        </button>
      </div>
    </>
  );
}
