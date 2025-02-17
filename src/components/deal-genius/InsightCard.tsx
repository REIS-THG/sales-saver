
import { Card } from "@/components/ui/card";
import { Insight } from "@/types/types";

interface InsightCardProps {
  insight: Insight;
  showConfidence?: boolean;
}

export const InsightCard = ({ insight, showConfidence = true }: InsightCardProps) => {
  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-50 border-green-200';
      case 'risk':
        return 'bg-red-50 border-red-200';
      case 'action_item':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`p-4 border-2 ${getInsightColor(insight.insight_type)}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium capitalize">{insight.insight_type}</h3>
        {showConfidence && insight.confidence_score && (
          <span className="text-sm text-gray-500">
            Confidence: {insight.confidence_score}%
          </span>
        )}
      </div>
      <p className="text-gray-700 mb-4">{insight.content}</p>
      {insight.coaching_suggestion && insight.confidence_score >= 70 && (
        <div className="mt-2 p-2 bg-blue-50 rounded">
          <h4 className="font-medium text-blue-700">Next Steps:</h4>
          <p className="text-blue-600">{insight.coaching_suggestion}</p>
        </div>
      )}
      {insight.communication_template && (
        <div className="mt-2 p-2 bg-green-50 rounded">
          <h4 className="font-medium text-green-700">Communication Template:</h4>
          <p className="text-green-600">{insight.communication_template}</p>
        </div>
      )}
    </Card>
  );
};
