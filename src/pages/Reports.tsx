
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsList } from "@/components/reports/ReportsList";
import { ReportEditor } from "@/components/reports/ReportEditor";
import { ReportsEmptyState } from "@/components/reports/ReportsEmptyState";
import { ReportsLoadingState } from "@/components/reports/ReportsLoadingState";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/use-reports";
import { useNavigate } from "react-router-dom";

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("my-reports");
  const [showEditor, setShowEditor] = useState(false);
  const { reports, isLoading: isLoadingReports, error } = useReports();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  const handleCreateReport = () => {
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
  };

  if (isLoading || isLoadingReports) {
    return <ReportsLoadingState />;
  }

  if (!user) {
    return null;
  }

  // Check for free tier limitations
  const isFreeTier = user.subscription_status === 'free';
  const hasReachedLimit = isFreeTier && reports.length >= 1;

  // If we're showing the editor, render it instead of the reports list
  if (showEditor) {
    return (
      <div className="flex flex-col h-full">
        <ReportEditor onClose={handleCloseEditor} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ReportsHeader onCreateReport={handleCreateReport} />

      <div className="flex-1 space-y-4 p-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="my-reports">My Reports</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="shared">Shared with me</TabsTrigger>
          </TabsList>
          <TabsContent value="my-reports" className="space-y-4">
            {reports.length > 0 ? (
              <ReportsList reports={reports} />
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
                <p className="text-muted-foreground">
                  Report templates are coming soon...
                </p>
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
  );
}
