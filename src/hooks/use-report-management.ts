
import { useState } from "react";
import { useApiError } from "@/hooks/use-api-error";
import type { ReportConfiguration } from "@/components/reports/types";
import { createUserReport, updateUserReport, deleteUserReport } from "@/services/report-service";

export function useReportManagement() {
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();

  const createReport = async () => {
    try {
      const userId = await handleAuthCheck();
      if (!userId) return null;

      const initialConfig = {
        dimensions: [],
        metrics: [],
        filters: [],
        visualization: 'bar' as const
      };

      const newReport = await createUserReport(userId, initialConfig);
      handleSuccess("New report created successfully");
      return newReport;
    } catch (err) {
      handleError(err, "Failed to create report");
      return null;
    }
  };

  const updateReport = async (reportId: string, updates: Partial<ReportConfiguration>) => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    try {
      const updatedReport = await updateUserReport(reportId, updates);
      handleSuccess("Report updated successfully");
      return updatedReport;
    } catch (err) {
      handleError(err, "Failed to update report");
      return null;
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const deleteReport = async (reportId: string) => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    try {
      await deleteUserReport(reportId);
      handleSuccess("Report deleted successfully");
      return true;
    } catch (err) {
      handleError(err, "Failed to delete report");
      return false;
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  return {
    actionLoading,
    createReport,
    updateReport,
    deleteReport,
  };
}
