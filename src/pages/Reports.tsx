import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, BarChart2, PieChart, LineChart, Table } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useReports } from "@/hooks/use-reports";
import { ReportsList } from "@/components/reports/ReportsList";
import { ReportConfiguration } from "@/components/reports/ReportConfiguration";
import type { ReportConfiguration as ReportConfigType } from "@/components/reports/types";
import { useToast } from "@/hooks/use-toast";
import type { CustomField, Deal, User, StandardField } from "@/types/types";

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
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
  } = useReports();

  const [selectedReport, setSelectedReport] = useState<ReportConfigType | null>(null);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [userData, setUserData] = useState<User | null>(null);

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

  const visualizationTypes: { value: ReportConfigType["config"]["visualization"]; label: string; icon: JSX.Element }[] = [
    { value: 'bar', label: 'Bar Chart', icon: <BarChart2 className="h-4 w-4" /> },
    { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
    { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
  ];

  useEffect(() => {
    fetchReports();
    fetchUserData();
    fetchCustomFields();
    fetchDeals();
  }, [fetchReports]);

  const fetchUserData = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      const billingAddressData = data.billing_address as Record<string, string> | null;
      const billingAddress = {
        street: billingAddressData?.street || '',
        city: billingAddressData?.city || '',
        state: billingAddressData?.state || '',
        country: billingAddressData?.country || '',
        postal_code: billingAddressData?.postal_code || ''
      };

      setUserData({
        ...data,
        id: data.id,
        user_id: data.user_id || userId,
        full_name: data.full_name,
        role: data.role as 'sales_rep' | 'manager',
        theme: data.theme,
        default_deal_view: data.default_deal_view,
        custom_views: Array.isArray(data.custom_views) 
          ? data.custom_views.map(view => typeof view === 'string' ? JSON.parse(view) : view)
          : [],
        email: data.email,
        subscription_status: data.subscription_status as 'free' | 'pro' | 'enterprise',
        subscription_end_date: data.subscription_end_date,
        successful_deals_count: data.successful_deals_count || 0,
        billing_address: billingAddress,
        created_at: data.created_at,
        updated_at: data.updated_at
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
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
        notes: deal.notes || '',
        custom_fields: deal.custom_fields as Record<string, any> || {}
      }));

      setDeals(typedDeals);
    } catch (err) {
      console.error('Error fetching deals:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
    }
  };

  const handleCreateReport = async () => {
    const newReport = await createReport();
    if (newReport) {
      setSelectedReport(newReport);
      toast({
        title: "Success",
        description: "New report created",
      });
    }
  };

  const startEditingName = (report: ReportConfigType) => {
    setEditingReportId(report.id);
    setEditingName(report.name);
  };

  const saveReportName = async () => {
    if (!editingReportId) return;

    const updatedReport = await updateReport(editingReportId, { name: editingName });
    if (updatedReport) {
      setEditingReportId(null);
      setEditingName("");
    }
  };

  const handleExportExcel = async (report: ReportConfigType) => {
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
      console.error('Error exporting to Excel:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export to Excel",
      });
    }
  };

  const handleExportGoogleSheets = async (report: ReportConfigType) => {
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
      console.error('Error exporting to CSV:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export to CSV",
      });
    }
  };

  const generateReportData = (report: ReportConfigType) => {
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
          <Button onClick={handleCreateReport}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>

        <ReportsList
          reports={favoriteReports}
          onEdit={setSelectedReport}
          onDelete={deleteReport}
          onToggleFavorite={toggleFavorite}
          editingReportId={editingReportId}
          editingName={editingName}
          onEditNameChange={setEditingName}
          onSaveReportName={saveReportName}
          onExportExcel={handleExportExcel}
          onExportGoogleSheets={handleExportGoogleSheets}
          isFavorites={true}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchReports(page)}
          actionLoading={actionLoading}
        />

        <h2 className="text-xl font-semibold mb-4">All Reports</h2>
        <ReportsList
          reports={otherReports}
          onEdit={setSelectedReport}
          onDelete={deleteReport}
          onToggleFavorite={toggleFavorite}
          editingReportId={editingReportId}
          editingName={editingName}
          onEditNameChange={setEditingName}
          onSaveReportName={saveReportName}
          onExportExcel={handleExportExcel}
          onExportGoogleSheets={handleExportGoogleSheets}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchReports(page)}
          actionLoading={actionLoading}
        />

        {selectedReport && (
          <ReportConfiguration
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onUpdate={updateReport}
            standardFields={standardFields}
            customFields={customFields}
            aggregations={aggregations}
            visualizationTypes={visualizationTypes}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;
