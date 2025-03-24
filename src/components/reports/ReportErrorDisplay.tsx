
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportErrorDisplayProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ReportErrorDisplay({ error, onRetry, isRetrying = false }: ReportErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error generating report</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error}</p>
        {error.includes("data") && (
          <p className="text-sm">
            This may be due to insufficient data or incompatible dimension and metric selections.
          </p>
        )}
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm"
          className="self-start mt-2"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
