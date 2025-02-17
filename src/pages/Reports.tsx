
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Plus, BarChart2, PieChart, LineChart, Table, ArrowLeft } from "lucide-react";
import type { CustomField, Deal } from "@/types/types";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportConfiguration as ReportConfigComponent } from "@/components/reports/ReportConfiguration";
import type { ReportConfiguration, ReportVisualization } from "@/components/reports/types";

interface StandardField {
  field_name: string;
  field: string;
  field_type: "text" | "number" | "boolean" | "date";
}

const Reports = () => {
  const [reports, setReports] = useState<ReportConfiguration[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportConfiguration | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const standardFields: StandardField[] = [
    { field: 'amount', field_name: 'Deal Amount', field_type: 'number' },
    { field: 'status', field_name: 'Deal Status', field_type: 'text' },
    { field: 'health_score', field_name: 'Health Score', field_type: 'number' },
    { field: 'created_at', field_name: 'Creation Date', field_type: 'date' },
    { field: 'company_name', field_name: 'Company', field_type: 'text' },
  ];

  const aggregations = [
    { value: 'sum' as const, label: 'Sum' },
    { value: 'avg' as const, label: 'Average' },
    { value: 'count' as const, label: 'Count' },
    { value: 'min' as const, label: 'Minimum' },
    { value: 'max' as const, label: 'Maximum' },
  ];

  const visualizationTypes: { value: ReportVisualization; label: string; icon: JSX.Element }[] = [
    { value: 'bar', label: 'Bar Chart', icon: <BarChart2 className="h-4 w-4" /> },
    { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
    { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
  ];

  useEffect(() => {
    fetchReports();
    fetchCustomFields();
    fetchDeals();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from('report_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedReports: ReportConfiguration[] = (reportsData || []).map(report => ({
        ...report,
        config: {
          ...report.config,
          visualization: report.config.visualization as ReportVisualization
        }
      }));

      setReports(typedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reports",
      });
    }
  };

  const fetchCustomFields = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: fieldsData, error } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      
      const typedCustomFields: CustomField[] = (fieldsData || []).map(field => ({
        ...field,
        field_type: field.field_type as "text" | "number" | "boolean" | "date"
      }));
      
      setCustomFields(typedCustomFields);
    } catch (err) {
      console.error('Error fetching custom fields:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch custom fields",
      });
    }
  };

  const fetchDeals = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: dealsData, error } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const typedDeals: Deal[] = (dealsData || []).map(deal => ({
        ...deal,
        status: (deal.status || 'open') as 'open' | 'stalled' | 'won' | 'lost',
        custom_fields: deal.custom_fields as Record<string, string | number | boolean> | null
      }));

      setDeals(typedDeals);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deals:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const initialConfig = {
        dimensions: [],
        metrics: [],
        filters: [],
        visualization: 'bar' as ReportVisualization
      };

      const newReportData = {
        name: "New Report",
        description: "Custom report description",
        user_id: userId,
        config: initialConfig
      };

      const { data, error } = await supabase
        .from('report_configurations')
        .insert(newReportData)
        .select()
        .single();

      if (error) throw error;

      const newReport: ReportConfiguration = {
        ...data,
        config: {
          ...data.config,
          visualization: data.config.visualization as ReportVisualization
        }
      };

      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      
      toast({
        title: "Success",
        description: "New report created",
      });
    } catch (err) {
      console.error('Error creating report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report",
      });
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
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }

      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report",
      });
    }
  };

  const updateReport = async (reportId: string, updates: Partial<ReportConfiguration>) => {
    try {
      const { data, error } = await supabase
        .from('report_configurations')
        .update({
          ...updates,
          config: JSON.parse(JSON.stringify(updates.config))
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      const updatedReport: ReportConfiguration = {
        ...data,
        config: data.config as unknown as ReportConfig
      };

      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));
      setSelectedReport(updatedReport);

      toast({
        title: "Success",
        description: "Report updated successfully",
      });
    } catch (err) {
      console.error('Error updating report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report",
      });
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

      const updatedReport: ReportConfiguration = {
        ...data,
        config: data.config as unknown as ReportConfig,
        is_favorite: !currentStatus
      };

      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));

      toast({
        title: "Success",
        description: `Report ${!currentStatus ? 'added to' : 'removed from'} favorites`,
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorite status",
      });
    }
  };

  const startEditingName = (report: ReportConfiguration) => {
    setEditingReportId(report.id);
    setEditingName(report.name);
  };

  const saveReportName = async () => {
    if (!editingReportId) return;

    try {
      const { data, error } = await supabase
        .from('report_configurations')
        .update({ name: editingName })
        .eq('id', editingReportId)
        .select()
        .single();

      if (error) throw error;

      const updatedReport: ReportConfiguration = {
        ...data,
        config: data.config as unknown as ReportConfig
      };

      setReports(prev => prev.map(report => 
        report.id === editingReportId ? updatedReport : report
      ));

      setEditingReportId(null);
      setEditingName("");

      toast({
        title: "Success",
        description: "Report name updated successfully",
      });
    } catch (err) {
      console.error('Error updating report name:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report name",
      });
    }
  };

  const generateReportData = (report: ReportConfiguration) => {
    const formattedData = deals.map(deal => {
      const row: Record<string, any> = {};
      
      report.config.dimensions.forEach(dim => {
        if (dim.type === 'standard') {
          row[dim.label] = deal[dim.field as keyof Deal];
        } else if (dim.type === 'custom' && deal.custom_fields) {
          row[dim.label] = deal.custom_fields[dim.field];
        }
      });

      report.config.metrics.forEach(metric => {
        const value = deal[metric.field as keyof Deal];
        if (typeof value === 'number') {
          row[metric.label] = value;
        }
      });

      return row;
    });

    return formattedData;
  };

  const downloadExcel = async (report: ReportConfiguration) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to download reports",
        });
        return;
      }

      const data = generateReportData(report);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = `${userId}/${report.name}_${Date.now()}.xlsx`;
      const { error: uploadError } = await supabase.storage
        .from('report_exports')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('report_exports')
        .getPublicUrl(fileName);

      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = `${report.name}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (err) {
      console.error('Error downloading Excel:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download Excel file",
      });
    }
  };

  const downloadGoogleSheets = async (report: ReportConfiguration) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to download reports",
        });
        return;
      }

      const data = generateReportData(report);
      
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const cell = row[header];
          return typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"`
            : cell;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const fileName = `${userId}/${report.name}_${Date.now()}.csv`;
      const { error: uploadError } = await supabase.storage
        .from('report_exports')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('report_exports')
        .getPublicUrl(fileName);

      const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/create?usp=sheets_web&source=csv&url=${encodeURIComponent(publicUrl)}`;
      window.open(googleSheetsUrl, '_blank');

      toast({
        title: "Success",
        description: "Opening report in Google Sheets",
      });
    } catch (err) {
      console.error('Error exporting to Google Sheets:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export to Google Sheets",
      });
    }
  };

  const favoriteReports = reports.filter(report => report.is_favorite);
  const otherReports = reports.filter(report => !report.is_favorite);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Reports</h1>
          </div>
          <Button onClick={createReport}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>

        {favoriteReports.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Favorite Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {favoriteReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onEdit={setSelectedReport}
                  onDelete={deleteReport}
                  onToggleFavorite={toggleFavorite}
                  editingReportId={editingReportId}
                  editingName={editingName}
                  onEditNameChange={setEditingName}
                  onSaveReportName={saveReportName}
                  onExportExcel={downloadExcel}
                  onExportGoogleSheets={downloadGoogleSheets}
                />
              ))}
            </div>
          </>
        )}

        <h2 className="text-xl font-semibold mb-4">All Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onEdit={setSelectedReport}
              onDelete={deleteReport}
              onToggleFavorite={toggleFavorite}
              editingReportId={editingReportId}
              editingName={editingName}
              onEditNameChange={setEditingName}
              onSaveReportName={saveReportName}
              onExportExcel={downloadExcel}
              onExportGoogleSheets={downloadGoogleSheets}
            />
          ))}
        </div>

        {selectedReport && (
          <div className="mt-8">
            <ReportConfigComponent
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
              onUpdate={updateReport}
              standardFields={standardFields}
              customFields={customFields}
              aggregations={aggregations}
              visualizationTypes={visualizationTypes}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
