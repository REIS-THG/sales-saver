
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ReportsEmptyStateProps {
  onCreateReport: () => void;
}

export const ReportsEmptyState = ({ onCreateReport }: ReportsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
      <p className="text-gray-500 mb-4">Create your first report to get started</p>
      <Button onClick={onCreateReport}>
        <Plus className="h-4 w-4 mr-2" />
        Create Report
      </Button>
    </div>
  );
};
