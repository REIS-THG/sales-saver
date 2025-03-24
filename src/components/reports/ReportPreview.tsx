
import { ReportPreviewProps } from "./types";
import { ErrorBoundary } from "../ui/error-boundary";
import { useState } from "react";
import { ReportErrorDisplay } from "./ReportErrorDisplay";
import { useAxisFormatter } from "./hooks/useAxisFormatter";
import { BarChartComponent } from "./charts/BarChartComponent";
import { LineChartComponent } from "./charts/LineChartComponent";
import { PieChartComponent } from "./charts/PieChartComponent";
import { TableComponent } from "./charts/TableComponent";
import { NoDataDisplay } from "./components/NoDataDisplay";

export const ReportPreview = ({ config, data, onRetry }: ReportPreviewProps & { onRetry?: () => void }) => {
  const [error, setError] = useState<Error | null>(null);
  const formatXAxis = useAxisFormatter();

  // If no dimensions or metrics have been selected, or data is empty
  if (!data || data.length === 0) {
    return <NoDataDisplay />;
  }

  // Custom error boundary fallback component
  const handleError = (error: Error) => {
    console.error("Error in ReportPreview:", error);
    setError(error);
    return (
      <ReportErrorDisplay 
        error="An error occurred while rendering the report. Please try again with different settings."
        onRetry={onRetry || (() => {})}
      />
    );
  };

  // Render the appropriate visualization
  const renderVisualization = () => {
    try {
      switch (config.visualization) {
        case 'bar':
          return <BarChartComponent data={data} config={config} formatXAxis={formatXAxis} />;
        case 'line':
          return <LineChartComponent data={data} config={config} formatXAxis={formatXAxis} />;
        case 'pie':
          return <PieChartComponent data={data} config={config} />;
        case 'table':
          return <TableComponent data={data} config={config} formatXAxis={formatXAxis} />;
        default:
          return <NoDataDisplay message="Please select a visualization type." />;
      }
    } catch (err) {
      console.error("Error rendering visualization:", err);
      return (
        <ReportErrorDisplay 
          error="An error occurred while rendering the report. Please try again with different settings."
          onRetry={onRetry || (() => {})}
        />
      );
    }
  };

  return (
    <ErrorBoundary>
      {error ? handleError(error) : renderVisualization()}
    </ErrorBoundary>
  );
};
