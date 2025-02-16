
import type { Deal } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Clock, Ban } from "lucide-react";

interface DealCardProps {
  deal: Deal;
}

const DealCard = ({ deal }: DealCardProps) => {
  const getStatusIcon = (status: Deal["status"]) => {
    switch (status) {
      case "won":
        return <CheckCircle2 className="text-green-500" />;
      case "lost":
        return <Ban className="text-red-500" />;
      case "stalled":
        return <AlertCircle className="text-yellow-500" />;
      default:
        return <Clock className="text-blue-500" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{deal.deal_name}</CardTitle>
        {getStatusIcon(deal.status)}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Company</p>
            <p className="font-medium">{deal.company_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium">
              ${Number(deal.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact</p>
            <p className="font-medium">{`${deal.contact_first_name} ${deal.contact_last_name}`}</p>
            <p className="text-sm text-gray-500">{deal.contact_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Health Score</p>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthScoreColor(
                deal.health_score
              )}`}
            >
              {deal.health_score}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;
