
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsList } from "@/components/reports/ReportsList";
import { ReportEditor } from "@/components/reports/ReportEditor";
import { ReportsEmptyState } from "@/components/reports/ReportsEmptyState";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { MainHeader } from "@/components/layout/MainHeader";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/use-reports";
import { useNavigate } from "react-router-dom";
import type { ReportConfiguration } from "@/components/reports/types";
import { TemplatesList } from "@/components/reports/templates/TemplatesList";
import { ReportErrorDisplay } from "@/components/reports/ReportErrorDisplay";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("my-reports");
  const [showEditor, setShowEditor] = useState(false);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { 
    reports, 
    loading: reportsLoading, 
    error, 
    actionLoading,
    currentPage,
    totalPages,
    fetchReports,
    createReport,
    updateReport: updateReportBase,
    deleteReport,
  } = useReports();

  const updateReport = async (reportId: string, updates: Partial<ReportConfiguration>): Promise<void> => {
    await updateReportBase(reportId, updates);
  };

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/auth");
    }
  }, [userLoading, user, navigate]);

  const handleCreateReport = async () => {
    const newReport = await createReport();
    if (newReport) {
      setEditingReportId(newReport.id);
      setShowEditor(true);
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingReportId(null);
  };

  const handleEditReport = (report: ReportConfiguration) => {
    setEditingReportId(report.id);
    setEditingName(report.name);
    setShowEditor(true);
  };

  const handleEditNameChange = (name: string) => {
    setEditingName(name);
  };

  const handleSaveReportName = async () => {
    if (editingReportId) {
      await updateReport(editingReportId, { name: editingName });
      setEditingReportId(null);
    }
  };

  const handleToggleFavorite = async (reportId: string, currentStatus: boolean) => {
    await updateReport(reportId, { is_favorite: !currentStatus });
  };

  const handleDeleteReport = async (reportId: string) => {
    await deleteReport(reportId);
  };

  const handleUseTemplate = async (template: ReportConfiguration) => {
    // Create a new report based on the template
    const newReport = await createReport();
    if (newReport) {
      // Apply template configuration to the new report
      await updateReport(newReport.id, {
        name: template.name,
        description: template.description,
        config: template.config
      });
      
      // Navigate to editor with the new report
      setEditingReportId(newReport.id);
      setEditingName(template.name);
      setShowEditor(true);
    }
  };

  const handleExportExcel = async (report: ReportConfiguration) => {
    console.log("Export to Excel:", report);
    // Simulated delay for export process
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleExportGoogleSheets = async (report: ReportConfiguration) => {
    console.log("Export to Google Sheets:", report);
    // Simulated delay for export process
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handlePageChange = (page: number) => {
    fetchReports(page);
  };

  if (userLoading || reportsLoading) {
    return (
      <>
        <MainHeader userData={user} />
        <ReportsLoadingState />
      </>
    );
  }

  if (!user) {
    return null;
  }

  const isFreeTier = user.subscription_status === 'free';
  const hasReachedLimit = isFreeTier && reports.length >= 1;

  if (showEditor) {
    return (
      <div className="flex flex-col h-full">
        <MainHeader userData={user} />
        <ReportEditor 
          editingReportId={editingReportId}
          reports={reports} 
          onUpdate={updateReport}
          onClose={handleCloseEditor}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MainHeader userData={user} />
      <div className="flex flex-col h-full">
        <ReportsHeader 
          onCreateReport={handleCreateReport} 
          isLoading={reportsLoading}
          isFreePlan={isFreeTier}
        />

        <div className="flex-1 space-y-4 p-8 pt-6">
          {error && (
            <ReportErrorDisplay 
              error={error} 
              onRetry={() => fetchReports(currentPage)}
              isRetrying={reportsLoading}
            />
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-reports">My Reports</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="shared">Shared with me</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-reports" className="space-y-4">
              {reports.length > 0 ? (
                <ReportsList 
                  reports={reports}
                  onEdit={handleEditReport}
                  onDelete={handleDeleteReport}
                  onToggleFavorite={handleToggleFavorite}
                  editingReportId={editingReportId}
                  editingName={editingName}
                  onEditNameChange={handleEditNameChange}
                  onSaveReportName={handleSaveReportName}
                  onExportExcel={handleExportExcel}
                  onExportGoogleSheets={handleExportGoogleSheets}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  actionLoading={actionLoading}
                />
              ) : (
                <ReportsEmptyState onCreateReport={handleCreateReport} />
              )}

              {hasReachedLimit && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle>Free Tier Limitation</CardTitle>
                    <CardDescription>
                      You've reached the maximum number of reports for the free tier
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to Pro to create unlimited reports and unlock additional features.
                    </p>
                    <Button onClick={() => navigate("/subscription")}>
                      Upgrade to Pro
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>
                    Pre-designed report templates to help you get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TemplatesList onUseTemplate={handleUseTemplate} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shared">
              <Card>
                <CardHeader>
                  <CardTitle>Shared Reports</CardTitle>
                  <CardDescription>
                    Reports shared with you by team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No reports have been shared with you yet.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
