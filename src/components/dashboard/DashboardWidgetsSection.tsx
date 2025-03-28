
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";
import { useWidgetPreferences } from "@/hooks/use-widget-preferences";
import type { Deal, User } from "@/types/types";

interface DashboardWidgetsSectionProps {
  deals: Deal[];
  userData: User | null;
  loading: boolean;
  error: string | null;
}

export function DashboardWidgetsSection({
  deals,
  userData,
  loading,
  error
}: DashboardWidgetsSectionProps) {
  // Configure widget preferences
  const defaultWidgets = ["summary", "recent"];
  const { getVisibleWidgets, isLoaded } = useWidgetPreferences(defaultWidgets);
  
  if (!isLoaded) {
    return null;
  }
  
  return (
    <DashboardWidgets
      deals={deals}
      userData={userData}
      loading={loading}
      error={error}
    />
  );
}
