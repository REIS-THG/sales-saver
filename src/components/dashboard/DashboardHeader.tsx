
import { Button } from "@/components/ui/button";
import { LogOut, Settings, BarChart2, Sparkles, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CreateDealForm from "@/components/deals/CreateDealForm";
import type { CustomField } from "@/types/types";

interface DashboardHeaderProps {
  onDealCreated?: () => Promise<void>;
  customFields?: CustomField[];
  onBeforeCreate?: () => Promise<boolean>;
  onSignOut: () => void;
}

export function DashboardHeader({
  onDealCreated,
  customFields = [],
  onBeforeCreate = async () => true,
  onSignOut
}: DashboardHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end items-center">
        <div className="flex items-center gap-3">
          {location.pathname !== '/dashboard' && (
            <Button variant="default" onClick={() => navigate("/dashboard")}>
              <Plus className="h-5 w-5 mr-2" />
              Create Deal
            </Button>
          )}
          {location.pathname === '/dashboard' && (
            <CreateDealForm 
              onDealCreated={onDealCreated} 
              customFields={customFields}
              onBeforeCreate={onBeforeCreate}
            />
          )}
          <Button 
            variant={isActive('/ai-analysis') ? 'default' : 'outline'} 
            onClick={() => navigate("/ai-analysis")}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            AI Analysis
          </Button>
          <Button 
            variant={isActive('/reports') ? 'default' : 'outline'} 
            onClick={() => navigate("/reports")}
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            Reports
          </Button>
          <Button 
            variant={isActive('/settings') ? 'default' : 'outline'} 
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            onClick={onSignOut}
            className="border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
          >
            <LogOut className="h-5 w-5 mr-2 text-red-500" />
            <span className="text-red-500">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
