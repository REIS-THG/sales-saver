
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@/components/dashboard/UserButton";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/types";

interface MainHeaderProps {
  onSignOut?: () => void;
  userData?: User | null;
  children?: React.ReactNode;
}

export function MainHeader({ onSignOut, userData, children }: MainHeaderProps) {
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <nav className="flex items-center gap-2 mr-4">
              <Button
                asChild
                variant={isActivePath('/dashboard') ? "default" : "ghost"}
                className="font-medium"
              >
                <Link to="/dashboard">Deals</Link>
              </Button>
              <Button
                asChild
                variant={isActivePath('/reports') ? "default" : "ghost"}
                className="font-medium"
              >
                <Link to="/reports">Reports</Link>
              </Button>
              <Button
                asChild
                variant={isActivePath('/ai-analysis') ? "default" : "ghost"}
                className="font-medium"
              >
                <Link to="/ai-analysis">AI Analysis</Link>
              </Button>
              <Button
                asChild
                variant={isActivePath('/settings') ? "default" : "ghost"}
                className="font-medium"
              >
                <Link to="/settings">Settings</Link>
              </Button>
            </nav>
            {children}
          </div>
          <UserButton onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
