
import { TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ArrowRight, History } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabHeaderProps {
  value: string;
  icon: "chart" | "arrow" | "history";
  label: string;
  mobileLabel?: string;
}

export function TabHeader({ value, icon, label, mobileLabel }: TabHeaderProps) {
  const isMobile = useIsMobile();
  
  const getIcon = () => {
    switch (icon) {
      case "chart": return <BarChart3 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />;
      case "arrow": return <ArrowRight className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />;
      case "history": return <History className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />;
    }
  };
  
  return (
    <TabsTrigger 
      value={value}
      className={`flex items-center gap-2 py-3 transition-all duration-200 hover:bg-slate-100 
        ${isMobile ? 'px-1 text-xs' : 'px-3'}`}
    >
      {getIcon()}
      <span>{isMobile && mobileLabel ? mobileLabel : label}</span>
    </TabsTrigger>
  );
}
