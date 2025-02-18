
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ReportConfiguration, ReportConfig } from "@/components/reports/types";
import {
  fetchUserReports,
  createUserReport,
  updateUserReport,
  deleteUserReport,
  toggleReportFavorite
} from "@/services/report-service";

export function useReports() {
  const [reports, setReports] = useState<ReportConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchReports = async (page = currentPage) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        navigate("/auth");
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        console.error('No user ID found');
        navigate("/auth");
        return;
      }

      console.log('Fetching reports for page:', page);
      const { reports: reportsData, totalCount } = await fetchUserReports(userId, page);
      setReports(reportsData);
      setTotalPages(Math.ceil(totalCount / 9)); // 9 items per page
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reports",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        navigate("/auth");
        return null;
      }

      const userId = authData.user?.id;
      if (!userId) {
        console.error('No user ID found');
        navigate("/auth");
        return null;
      }

      const initialConfig: ReportConfig = {
        dimensions: [],
        metrics: [],
        filters: [],
        visualization: 'bar'
      };

      const newReport = await createUserReport(userId, initialConfig);
      setReports(prev => [newReport, ...prev]);
      
      toast({
        title: "Success",
        description: "New report created successfully",
      });
      
      return newReport;
    } catch (err) {
      console.error('Error creating report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report",
      });
      return null;
    }
  };

  const updateReport = async (reportId: string, updates: Partial<ReportConfiguration>) => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    try {
      const updatedReport = await updateUserReport(reportId, updates);
      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));
      
      toast({
        title: "Success",
        description: "Report updated successfully",
      });
      
      return updatedReport;
    } catch (err) {
      console.error('Error updating report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report",
      });
      return null;
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const deleteReport = async (reportId: string) => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    try {
      await deleteUserReport(reportId);
      setReports(prev => prev.filter(report => report.id !== reportId));
      
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
      return true;
    } catch (err) {
      console.error('Error deleting report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report",
      });
      return false;
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const toggleFavorite = async (reportId: string, currentStatus: boolean) => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    try {
      const updatedReport = await toggleReportFavorite(reportId, currentStatus);
      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));

      toast({
        title: "Success",
        description: `Report ${!currentStatus ? 'added to' : 'removed from'} favorites`,
      });
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorite status",
      });
      return false;
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  return {
    reports,
    loading,
    actionLoading,
    currentPage,
    totalPages,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    toggleFavorite,
  };
}
