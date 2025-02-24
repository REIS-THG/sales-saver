
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportsHeaderProps {
  onCreateReport: () => void;
  isLoading: boolean;
  isFreePlan: boolean;
}

export const ReportsHeader = ({ onCreateReport, isLoading, isFreePlan }: ReportsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateReport} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
        {isFreePlan && (
          <Button onClick={() => navigate("/subscription")}>
            Upgrade to Pro
          </Button>
        )}
      </div>
    </div>
  );
};
