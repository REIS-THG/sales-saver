
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  BarChart3,
  LayoutDashboard,
  Zap,
  FileText,
  BrainCircuit,
  Settings,
  HelpCircle,
  X
} from "lucide-react";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 mr-2" /> },
    { name: "Deal Sourcing", path: "/deal-sourcing", icon: <Zap className="h-5 w-5 mr-2" /> },
    { name: "Deal Desk", path: "/deal-desk", icon: <FileText className="h-5 w-5 mr-2" /> },
    { name: "Reports", path: "/reports", icon: <BarChart3 className="h-5 w-5 mr-2" /> },
    { name: "AI Analysis", path: "/ai-analysis", icon: <BrainCircuit className="h-5 w-5 mr-2" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5 mr-2" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  const closeMenu = () => setOpen(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="mr-2 h-10 w-10 px-0" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[350px] pt-10">
          <div className="flex flex-col gap-6">
            <div className="px-2 flex justify-between items-center">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sales Saver
              </h2>
              <Button variant="ghost" size="icon" onClick={closeMenu} className="h-8 w-8 p-0" aria-label="Close menu">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="justify-start"
                  onClick={closeMenu}
                >
                  <Link to={item.path}>
                    {item.icon}
                    {item.name}
                  </Link>
                </Button>
              ))}
            </nav>
            <div className="mt-auto pt-4 border-t">
              <Button variant="outline" className="w-full justify-start" asChild onClick={closeMenu}>
                <Link to="/help">
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Help & Resources
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
