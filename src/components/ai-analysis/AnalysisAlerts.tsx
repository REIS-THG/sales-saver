
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface AnalysisAlertsProps {
  error: string | null;
  isAnalysisLimited: boolean;
}

export function AnalysisAlerts({ error, isAnalysisLimited }: AnalysisAlertsProps) {
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isAnalysisLimited && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Limit Reached</AlertTitle>
          <AlertDescription>
            You've reached your free analysis limit. Upgrade to Pro for unlimited analysis and additional features.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
