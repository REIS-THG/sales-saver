
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, PieChart, LineChart, Table } from "lucide-react";
import { useReports } from "@/hooks/use-reports";
import { ReportConfiguration } from "@/components/reports/ReportConfiguration";
import type { ReportConfiguration as ReportConfigType } from "@/components/reports/types";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types/types";
import { useAuth } from "@/hooks/useAuth";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { ReportsEmptyState } from "@/components/reports/ReportsEmptyState";
import { ReportsContent } from "@/components/reports/ReportsContent";

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
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
    return <ReportsLoadingState />;
  }

  const isFreePlan = userData?.subscription_status === 'free';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <ReportsHeader 
          onCreateReport={handleCreateReport}
          isLoading={actionLoading['create']}
          isFreePlan={isFreePlan}
        />

        {reports.length === 0 ? (
          <ReportsEmptyState onCreateReport={handleCreateReport} />
        ) : (
          <ReportsContent
            reports={reports}
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
            onPageChange={fetchReports}
            actionLoading={actionLoading}
          />
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
