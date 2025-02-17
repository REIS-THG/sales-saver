
import { Insight } from "@/types/types";
import { InsightCard } from "./InsightCard";
import { Spinner } from "@/components/ui/spinner";

interface InsightsListProps {
  insights: Insight[];
  isLoading: boolean;
}

export function InsightsList({ insights, isLoading }: InsightsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
