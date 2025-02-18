
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ReportConfiguration, ReportConfig, ReportVisualization } from "@/components/reports/types";
import type { Json } from "@/integrations/supabase/types";

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

      const { data: reportsData, error } = await supabase
        .from('report_configurations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedReports: ReportConfiguration[] = (reportsData || []).map(report => {
        const config = typeof report.config === 'string' 
          ? JSON.parse(report.config) 
          : report.config;

        return {
          id: report.id,
          user_id: report.user_id,
          name: report.name,
          description: report.description || undefined,
          config: {
            dimensions: config.dimensions || [],
            metrics: config.metrics || [],
            filters: config.filters || [],
            visualization: (config.visualization || 'bar') as ReportVisualization
          },
          created_at: report.created_at,
          updated_at: report.updated_at,
          is_favorite: report.is_favorite
        };
      });

      setReports(typedReports);
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

      const newReportData = {
        name: "New Report",
        description: "Custom report description",
        user_id: userId,
        config: initialConfig as unknown as Json
      };

      const { data, error } = await supabase
        .from('report_configurations')
        .insert(newReportData)
        .select()
        .single();

      if (error) throw error;

      const config = typeof data.config === 'string' 
        ? JSON.parse(data.config) 
        : data.config;

      const newReport: ReportConfiguration = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        description: data.description || undefined,
        config: {
          dimensions: config.dimensions || [],
          metrics: config.metrics || [],
          filters: config.filters || [],
          visualization: (config.visualization || 'bar') as ReportVisualization
        },
        created_at: data.created_at,
        updated_at: data.updated_at,
        is_favorite: data.is_favorite
      };

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
      const updateData = {
        ...updates,
        config: updates.config ? (updates.config as unknown as Json) : undefined
      };

      const { data, error } = await supabase
        .from('report_configurations')
        .update(updateData)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      const config = typeof data.config === 'string' 
        ? JSON.parse(data.config) 
        : data.config;

      const updatedReport: ReportConfiguration = {
        ...data,
        config: {
          dimensions: config.dimensions || [],
          metrics: config.metrics || [],
          filters: config.filters || [],
          visualization: (config.visualization || 'bar') as ReportVisualization
        }
      };

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
      const { error } = await supabase
        .from('report_configurations')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('report_configurations')
        .update({ 
          is_favorite: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      const config = typeof data.config === 'string' 
        ? JSON.parse(data.config) 
        : data.config;

      const updatedReport: ReportConfiguration = {
        ...data,
        config: {
          dimensions: config.dimensions || [],
          metrics: config.metrics || [],
          filters: config.filters || [],
          visualization: (config.visualization || 'bar') as ReportVisualization
        }
      };

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
