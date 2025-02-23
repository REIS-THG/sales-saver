
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AnalysisHeaderProps {
  subscriptionTier: 'free' | 'pro' | 'enterprise';
}

export function AnalysisHeader({ subscriptionTier }: AnalysisHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between space-x-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">AI Analysis</h1>
        <p className="text-sm text-gray-500">
          Analyze your deals with advanced AI insights
        </p>
      </div>
      
      {subscriptionTier === 'free' && (
        <Button
          variant="outline"
          onClick={() => navigate("/settings/subscription")}
          className="shrink-0"
        >
          <span>Upgrade to Pro</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
            Get Unlimited Analysis
          </span>
        </Button>
      )}
    </div>
  );
}
