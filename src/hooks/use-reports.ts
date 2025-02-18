
import { useState } from "react";
import { useApiError } from "@/hooks/use-api-error";
import { useReportManagement } from "@/hooks/use-report-management";
import { useReportFavorites } from "@/hooks/use-report-favorites";
import type { ReportConfiguration } from "@/components/reports/types";
import { fetchUserReports } from "@/services/report-service";

export function useReports() {
  const [reports, setReports] = useState<ReportConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { handleAuthCheck, handleError } = useApiError();
  const { actionLoading: managementLoading, createReport, updateReport, deleteReport } = useReportManagement();
  const { actionLoading: favoritesLoading, toggleFavorite: toggleFavoriteBase } = useReportFavorites();

  const actionLoading = { ...managementLoading, ...favoritesLoading };

  const fetchReports = async (page = currentPage) => {
    try {
      const userId = await handleAuthCheck();
      if (!userId) return;

      console.log('Fetching reports for page:', page);
      const { reports: reportsData, totalCount } = await fetchUserReports(userId, page);
      
      console.log(`Successfully fetched ${reportsData.length} reports`);
      
      setReports(reportsData);
      setTotalPages(Math.ceil(totalCount / 9)); // 9 items per page
      setCurrentPage(page);
    } catch (err) {
      handleError(err, "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

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
    const newReport = await createReport();
    if (newReport) {
      setReports(prev => [newReport, ...prev]);
    }
    return newReport;
  };

  const handleDeleteReport = async (reportId: string) => {
    const success = await deleteReport(reportId);
    if (success) {
      setReports(prev => prev.filter(report => report.id !== reportId));
    }
    return success;
  };

  return {
    reports,
    loading,
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
