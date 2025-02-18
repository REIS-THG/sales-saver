
import { useState } from "react";
import { useApiError } from "@/hooks/use-api-error";
import type { ReportConfiguration } from "@/components/reports/types";
import { toggleReportFavorite } from "@/services/report-service";

export function useReportFavorites() {
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const { handleError, handleSuccess } = useApiError();

  const toggleFavorite = async (reportId: string, currentStatus: boolean) => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    try {
      const updatedReport = await toggleReportFavorite(reportId, currentStatus);
      handleSuccess(`Report ${!currentStatus ? 'added to' : 'removed from'} favorites`);
      return updatedReport;
    } catch (err) {
      handleError(err, "Failed to update favorite status");
      return null;
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  return {
    actionLoading,
    toggleFavorite,
  };
}
