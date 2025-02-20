
import { useState, useCallback, useEffect } from "react";
import { useApiError } from "@/hooks/use-api-error";
import { useReportManagement } from "@/hooks/use-report-management";
import { useReportFavorites } from "@/hooks/use-report-favorites";
import type { ReportConfiguration } from "@/components/reports/types";
import { fetchUserReports } from "@/services/report-service";
import { useAuth } from "@/hooks/useAuth";

export function useReports() {
  const [reports, setReports] = useState<ReportConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();
  const { actionLoading: managementLoading, createReport, updateReport, deleteReport } = useReportManagement();
  const { actionLoading: favoritesLoading, toggleFavorite: toggleFavoriteBase } = useReportFavorites();
  const { user } = useAuth();

  const actionLoading = { ...managementLoading, ...favoritesLoading };

  const fetchReports = useCallback(async (page = currentPage) => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching reports for page:', page);
      const { reports: reportsData, totalCount } = await fetchUserReports(user.id, page);
      
      console.log(`Successfully fetched ${reportsData.length} reports`);
      
      setReports(reportsData);
      setTotalPages(Math.ceil(totalCount / 9)); // 9 items per page
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching reports:', err);
      handleError(err, "Failed to fetch reports");
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, user, handleError]);

  // Fetch reports when the user or page changes
  useEffect(() => {
    fetchReports(currentPage);
  }, [fetchReports, currentPage]);

  const toggleFavorite = async (reportId: string, currentStatus: boolean) => {
    const updatedReport = await toggleFavoriteBase(reportId, currentStatus);
    if (updatedReport) {
      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));
      return true;
    }
    return false;
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<ReportConfiguration>) => {
    const updatedReport = await updateReport(reportId, updates);
    if (updatedReport) {
      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));
    }
    return updatedReport;
  };

  const handleCreateReport = async () => {
    if (!user) return null;
    
    const newReport = await createReport();
    if (newReport) {
      setReports(prev => [newReport, ...prev]);
      handleSuccess("Report created successfully");
    }
    return newReport;
  };

  const handleDeleteReport = async (reportId: string) => {
    const success = await deleteReport(reportId);
    if (success) {
      setReports(prev => prev.filter(report => report.id !== reportId));
      handleSuccess("Report deleted successfully");
    }
    return success;
  };

  return {
    reports,
    loading,
    error,
    actionLoading,
    currentPage,
    totalPages,
    fetchReports,
    createReport: handleCreateReport,
    updateReport: handleUpdateReport,
    deleteReport: handleDeleteReport,
    toggleFavorite,
  };
}
