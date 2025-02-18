
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const reportsData = await fetchUserReports(userId);
      setReports(reportsData);
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
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
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
    }
  };

  const deleteReport = async (reportId: string) => {
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
    }
  };

  const toggleFavorite = async (reportId: string, currentStatus: boolean) => {
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
    }
  };

  return {
    reports,
    loading,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    toggleFavorite,
  };
}
