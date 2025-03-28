
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@/components/dashboard/UserButton";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "./MobileNavigation";
import type { User } from "@/types/types";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainHeaderProps {
  onSignOut?: () => void;
  userData?: User | null;
  children?: React.ReactNode;
  onResetTour?: () => void;
  className?: string;
}

export function MainHeader({ onSignOut, userData, children, onResetTour, className }: MainHeaderProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showHelpOptions, setShowHelpOptions] = useState(false);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className={`bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile Navigation */}
            <MobileNavigation />
            
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-2 mr-4">
              <Button
                asChild
                variant={isActivePath('/dashboard') ? "default" : "ghost"}
                className="font-medium"
              >
                <Link to="/dashboard">Deals</Link>
              </Button>
              <Button
                asChild
                variant={isActivePath('/deal-sourcing') ? "default" : "ghost"}
                className="font-medium"
              >
                <Link to="/deal-sourcing">Deal Sourcing</Link>
              </Button>
              <Button
                asChild
                variant={isActivePath('/deal-desk') ? "default" : "ghost"}
                className="font-medium"
              >
                <Link to="/deal-desk">Deal Desk</Link>
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
          
          <div className="flex items-center gap-2">
            {/* Help Button - Slightly larger on mobile */}
            {onResetTour && (
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "icon"} 
                onClick={onResetTour}
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                aria-label="Help"
              >
                <HelpCircle className={`${isMobile ? "h-6 w-6" : "h-5 w-5"}`} />
                {isMobile && <span className="sr-only">Help</span>}
              </Button>
            )}
            <UserButton onSignOut={onSignOut} />
          </div>
        </div>
      </div>
    </header>
  );
}
