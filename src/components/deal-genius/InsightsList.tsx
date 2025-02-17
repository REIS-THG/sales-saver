
import { Insight } from "@/types/types";
import { InsightCard } from "./InsightCard";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightsListProps {
  insights: Insight[];
  isLoading: boolean;
}

export function InsightsList({ insights, isLoading }: InsightsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
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
