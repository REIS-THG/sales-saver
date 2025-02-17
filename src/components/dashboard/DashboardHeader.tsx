
import { Button } from "@/components/ui/button";
import { LogOut, Settings, BarChart2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateDealForm from "@/components/deals/CreateDealForm";
import type { CustomField } from "@/types/types";

interface DashboardHeaderProps {
  onDealCreated: () => Promise<void>;
  customFields: CustomField[];
  onBeforeCreate: () => Promise<boolean>;
  onSignOut: () => void;
}

export function DashboardHeader({
  onDealCreated,
  customFields,
  onBeforeCreate,
  onSignOut
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
        <div className="flex items-center gap-4">
          <CreateDealForm 
            onDealCreated={onDealCreated} 
            customFields={customFields}
            onBeforeCreate={onBeforeCreate}
          />
          <Button variant="outline" onClick={() => navigate("/deal-genius")}>
            <Sparkles className="h-5 w-5 mr-2" />
            AI Analysis
          </Button>
          <Button variant="ghost" onClick={() => navigate("/reports")}>
            <BarChart2 className="h-5 w-5 mr-2" />
            Reports
          </Button>
          <Button variant="ghost" onClick={() => navigate("/settings")}>
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" onClick={onSignOut}>
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
