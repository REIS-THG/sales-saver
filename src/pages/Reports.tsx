
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReports } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { ReportsEmptyState } from "@/components/reports/ReportsEmptyState";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { MainHeader } from "@/components/layout/MainHeader";
import { ReportEditor } from "@/components/reports/ReportEditor";
import { useReportActions } from "@/components/reports/ReportActions";
import type { ReportConfiguration as ReportConfigType } from "@/components/reports/types";

const Reports = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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

  // Fixing type mismatches for report actions
  const { handleCreateReport, handleUpdateReport, handleExportExcel, handleExportGoogleSheets } = 
    useReportActions({
      onCreateReport: async () => {
        const newReport = await createReport();
        if (newReport) {
          setEditingReportId(newReport.id);
        }
      },
      // Return type fixed to match ReportConfiguration | null
      onUpdateReport: async (reportId: string, updates: Partial<ReportConfigType>): Promise<ReportConfigType | null> => {
        return await updateReport(reportId, updates);
      },
      onExportExcel: async () => {},
      onExportGoogleSheets: async () => {},
    });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleEditReport = (report: ReportConfigType) => {
    setEditingReportId(report.id);
    setEditingName(report.name);
  };

  const handleEditNameChange = (newName: string) => {
    setEditingName(newName);
  };

  const saveReportName = async () => {
    if (!editingReportId) return;
    const updated = await handleUpdateReport(editingReportId, { name: editingName });
    if (updated) {
      setEditingReportId(null);
      setEditingName("");
    }
  };

  if (authLoading || reportsLoading) {
    return <ReportsLoadingState />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MainHeader onSignOut={() => navigate("/auth")} userData={user} />
      <div className="container mx-auto p-6">
        <ReportsHeader 
          onCreateReport={handleCreateReport}
          isLoading={actionLoading['create']}
          isFreePlan={user?.subscription_status === 'free'}
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

        <ReportEditor
          editingReportId={editingReportId}
          reports={reports}
          onUpdate={handleUpdateReport}
          onClose={() => setEditingReportId(null)}
        />
      </div>
    </div>
  );
};

export default Reports;
