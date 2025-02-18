
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@/components/dashboard/UserButton";
import type { User } from "@/types/types";

interface MainHeaderProps {
  onSignOut?: () => void;
  userData?: User | null;
  children?: React.ReactNode;
}

export function MainHeader({ onSignOut, userData, children }: MainHeaderProps) {
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path ? "text-primary font-semibold" : "text-gray-600";
  };

  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-4 mr-4">
              <Link 
                to="/dashboard" 
                className={`${isActivePath('/dashboard')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}
              >
                Deals
              </Link>
              <Link 
                to="/reports" 
                className={`${isActivePath('/reports')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}
              >
                Reports
              </Link>
              <Link 
                to="/ai-analysis" 
                className={`${isActivePath('/ai-analysis')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}
              >
                AI Analysis
              </Link>
              <Link 
                to="/settings" 
                className={`${isActivePath('/settings')} hover:text-gray-900 px-3 py-2 text-sm font-medium`}
              >
                Settings
              </Link>
            </nav>
            {children}
          </div>
          <UserButton onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
