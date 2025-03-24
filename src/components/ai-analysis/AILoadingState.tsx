
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Brain } from "lucide-react";

interface AILoadingStateProps {
  message?: string;
}

export function AILoadingState({ message = "AI is analyzing your data..." }: AILoadingStateProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 animate-pulse" />
      <CardContent className="p-8 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-blue-200/30 animate-ping" />
          <div className="relative bg-white p-3 rounded-full border border-blue-200 shadow-md">
            <Brain className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
          <p className="text-sm text-gray-600 max-w-md">
            Our AI is processing your data to generate insights, recommendations, and analysis. This typically takes 10-30 seconds.
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-6">
          <Spinner size="md" className="text-blue-500" />
          <div className="space-y-1">
            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-progress" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-gray-500">Processing...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add this to src/index.css
// @keyframes progress {
//   0% { width: 0%; }
//   50% { width: 70%; }
//   100% { width: 70%; }
// }
// .animate-progress {
//   animation: progress 2s ease-out forwards;
// }
