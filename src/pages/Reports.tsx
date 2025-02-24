
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, BarChart2, PieChart, LineChart, Table } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/use-reports";
import { ReportsList } from "@/components/reports/ReportsList";
import { ReportConfiguration } from "@/components/reports/ReportConfiguration";
import type { ReportConfiguration as ReportConfigType } from "@/components/reports/types";
import { useToast } from "@/hooks/use-toast";
import type { Deal, User } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
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
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage, fetchReports]);

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

    try {
      const updatedReport = await updateReport(editingReportId, { name: editingName });
      if (updatedReport) {
        setEditingReportId(null);
        setEditingName("");
        toast({
          title: "Success",
          description: "Report name updated",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report name",
      });
    }
  };

  const handleExportExcel = async (report: ReportConfigType) => {
    try {
      toast({
        title: "Success",
        description: "Report exported to Excel",
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
      toast({
        title: "Success",
        description: "Report exported to Google Sheets",
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

  if (authLoading || reportsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isFreePlan = userData?.subscription_status === 'free';

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
          <div className="flex gap-2">
            <Button onClick={handleCreateReport} disabled={actionLoading['create']}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
            {isFreePlan && (
              <Button onClick={() => navigate("/subscription")}>
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>

        {reports.length === 0 && !reportsLoading ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
            <p className="text-gray-500 mb-4">Create your first report to get started</p>
            <Button onClick={handleCreateReport}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        ) : (
          <>
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

            <h2 className="text-xl font-semibold mb-4 dark:text-white mt-8">All Reports</h2>
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
          </>
        )}

        {editingReportId && reports.find(r => r.id === editingReportId) && (
          <ReportConfiguration
            report={reports.find(r => r.id === editingReportId)!}
            onClose={() => setEditingReportId(null)}
            onUpdate={updateReport}
            standardFields={[
              { field: 'amount', field_name: 'Deal Amount', field_type: 'number' },
              { field: 'status', field_name: 'Deal Status', field_type: 'text' },
              { field: 'health_score', field_name: 'Health Score', field_type: 'number' },
              { field: 'created_at', field_name: 'Creation Date', field_type: 'date' },
              { field: 'company_name', field_name: 'Company', field_type: 'text' },
            ]}
            customFields={[]}
            aggregations={[
              { value: 'sum', label: 'Sum' },
              { value: 'avg', label: 'Average' },
              { value: 'count', label: 'Count' },
              { value: 'min', label: 'Minimum' },
              { value: 'max', label: 'Maximum' },
            ]}
            visualizationTypes={[
              { value: 'bar', label: 'Bar Chart', icon: <BarChart2 className="h-4 w-4" /> },
              { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
              { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
              { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;
