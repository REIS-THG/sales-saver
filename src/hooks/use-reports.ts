
import { useState, useCallback, useEffect, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  
  const { handleAuthCheck, handleError, handleSuccess } = useApiError();
  const { actionLoading: managementLoading, createReport, updateReport, deleteReport } = useReportManagement();
  const { actionLoading: favoritesLoading, toggleFavorite: toggleFavoriteBase } = useReportFavorites();
  const { user } = useAuth();

  const actionLoading = { ...managementLoading, ...favoritesLoading };

  // Modified fetchReports to include error handling and prevent infinite loop
  const fetchReports = useCallback(async (page = currentPage) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // For MVP, let's use mock data to show visualizations
      const mockReports: ReportConfiguration[] = [
        {
          id: "1",
          user_id: user.id,
          name: "Sales Overview",
          description: "Monthly sales performance",
          config: {
            dimensions: [{ field: "month", type: "standard", label: "Month" }],
            metrics: [{ field: "amount", aggregation: "sum", label: "Total Sales" }],
            filters: [],
            visualization: "bar"
          },
          is_favorite: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          user_id: user.id,
          name: "Deal Pipeline",
          description: "Current pipeline status",
          config: {
            dimensions: [{ field: "status", type: "standard", label: "Status" }],
            metrics: [{ field: "amount", aggregation: "sum", label: "Deal Value" }],
            filters: [],
            visualization: "pie"
          },
          is_favorite: false,
          created_at: new Date().toISOString(),
        }
      ];

      startTransition(() => {
        setReports(mockReports);
        setTotalPages(1); // For MVP, we'll just show one page
        setCurrentPage(page);
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      handleError(err, "Failed to fetch reports");
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, handleError]);

  // Only fetch reports once when component mounts or user changes
  useEffect(() => {
    fetchReports(1);
  }, [user]); // Remove currentPage dependency to prevent infinite loop

  const toggleFavorite = async (reportId: string, currentStatus: boolean) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return false;

    // For MVP, update locally without API call
    startTransition(() => {
      setReports(prev => prev.map(r => 
        r.id === reportId ? { ...r, is_favorite: !currentStatus } : r
      ));
    });
    return true;
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<ReportConfiguration>) => {
    // For MVP, update locally without API call
    startTransition(() => {
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, ...updates } : report
      ));
    });
    return reports.find(r => r.id === reportId);
  };

  const handleCreateReport = async () => {
    if (!user) return null;
    
    const newReport: ReportConfiguration = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      name: "New Report",
      description: "",
      config: {
        dimensions: [],
        metrics: [],
        filters: [],
        visualization: "bar"
      },
      created_at: new Date().toISOString(),
      is_favorite: false
    };

    startTransition(() => {
      setReports(prev => [newReport, ...prev]);
    });
    handleSuccess("Report created successfully");
    return newReport;
  };

  const handleDeleteReport = async (reportId: string) => {
    startTransition(() => {
      setReports(prev => prev.filter(report => report.id !== reportId));
    });
    handleSuccess("Report deleted successfully");
    return true;
  };

  return {
    reports,
    loading: loading || isPending,
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
