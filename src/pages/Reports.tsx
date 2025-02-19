import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, BarChart2, PieChart, LineChart, Table } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { useReports } from "@/hooks/use-reports";
import { ReportsList } from "@/components/reports/ReportsList";
import { ReportConfiguration } from "@/components/reports/ReportConfiguration";
import type { ReportConfiguration as ReportConfigType } from "@/components/reports/types";
import { useToast } from "@/hooks/use-toast";
import type { CustomField, Deal, User } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";

const standardFields: { field_name: string; field: string; field_type: "text" | "number" | "boolean" | "date" | "product"; }[] = [
  { field: 'amount', field_name: 'Deal Amount', field_type: 'number' },
  { field: 'status', field_name: 'Deal Status', field_type: 'text' },
  { field: 'health_score', field_name: 'Health Score', field_type: 'number' },
  { field: 'created_at', field_name: 'Creation Date', field_type: 'date' },
  { field: 'company_name', field_name: 'Company', field_type: 'text' },
];

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const {
    reports,
    loading: reportsLoading,
    actionLoading,
    currentPage,
    totalPages,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    toggleFavorite,
  } = useReports();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserData({
          ...data,
          role: data.role as 'sales_rep' | 'manager',
          subscription_status: data.subscription_status ? 'pro' : 'free'
        } as User);
      }
    };

    fetchUserData();
  }, [user?.id]);

  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!user?.id) return;

      const { data: fieldsData, error } = await supabase
        .from('custom_fields')
        .select('*')
        .eq('user_id', user.id);

      if (!error && fieldsData) {
        setCustomFields(fieldsData.map(field => ({
          ...field,
          field_type: field.field_type as "text" | "number" | "boolean" | "date" | "product"
        })));
      }
    };

    fetchCustomFields();
  }, [user?.id]);

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user?.id) return;

      const { data: dealsData, error } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id);

      if (!error && dealsData) {
        setDeals(dealsData.map(deal => ({
          ...deal,
          status: (deal.status || 'open') as 'open' | 'won' | 'lost' | 'stalled',
        })));
      }
    };

    fetchDeals();
  }, [user?.id]);

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

  const isFreePlan = userData?.subscription_status === 'free';
  const upgradeButton = isFreePlan ? (
    <Link to="/subscription" className="w-full sm:w-auto">
      <Button className="w-full">
        Upgrade to Pro
      </Button>
    </Link>
  ) : null;

  const handleCreateReport = async () => {
    try {
      const newReport = await createReport();
      if (newReport) {
        setEditingReportId(newReport.id);
        toast({
          title: "Success",
          description: "New report created",
        });
      }
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report",
      });
    }
  };

  const handleEditReport = (report: ReportConfigType) => {
    setEditingReportId(report.id);
    setEditingName(report.name);
  };

  const handleEditNameChange = (newName: string) => {
    setEditingName(newName);
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
      const data = generateReportData(report);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${report.name}.xlsx`);
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
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  if (loading || reportsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
          </div>
          <Button onClick={handleCreateReport} disabled={actionLoading['create']}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
          {upgradeButton}
        </div>

        <ReportsList
          reports={reports.filter(report => report.is_favorite)}
          onEdit={handleEditReport}
          onDelete={deleteReport}
          onToggleFavorite={toggleFavorite}
          editingReportId={editingReportId}
          editingName={editingName}
          onEditNameChange={handleEditNameChange}
          onSaveReportName={saveReportName}
          onExportExcel={handleExportExcel}
          onExportGoogleSheets={handleExportGoogleSheets}
          isFavorites={true}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchReports(page)}
          actionLoading={actionLoading}
        />

        <h2 className="text-xl font-semibold mb-4 dark:text-white">All Reports</h2>
        <ReportsList
          reports={reports.filter(report => !report.is_favorite)}
          onEdit={handleEditReport}
          onDelete={deleteReport}
          onToggleFavorite={toggleFavorite}
          editingReportId={editingReportId}
          editingName={editingName}
          onEditNameChange={handleEditNameChange}
          onSaveReportName={saveReportName}
          onExportExcel={handleExportExcel}
          onExportGoogleSheets={handleExportGoogleSheets}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchReports(page)}
          actionLoading={actionLoading}
        />

        {editingReportId && reports.find(r => r.id === editingReportId) && (
          <ReportConfiguration
            report={reports.find(r => r.id === editingReportId)!}
            onClose={() => setEditingReportId(null)}
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
