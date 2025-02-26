
import { useToast } from "@/hooks/use-toast";
import type { ReportConfiguration as ReportConfigType } from "./types";

interface ReportActionsProps {
  onCreateReport: () => Promise<void>;
  onUpdateReport: (reportId: string, updates: Partial<ReportConfigType>) => Promise<ReportConfigType | null>;
  onExportExcel: (report: ReportConfigType) => Promise<void>;
  onExportGoogleSheets: (report: ReportConfigType) => Promise<void>;
}

export const useReportActions = ({
  onCreateReport,
  onUpdateReport,
  onExportExcel,
  onExportGoogleSheets,
}: ReportActionsProps) => {
  const { toast } = useToast();

  const handleCreateReport = async () => {
    try {
      await onCreateReport();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report",
      });
    }
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<ReportConfigType>) => {
    try {
      const updatedReport = await onUpdateReport(reportId, updates);
      return updatedReport;
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report",
      });
      return null;
    }
  };

  const handleExportExcel = async (report: ReportConfigType) => {
    try {
      await onExportExcel(report);
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
      await onExportGoogleSheets(report);
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

  return {
    handleCreateReport,
    handleUpdateReport,
    handleExportExcel,
    handleExportGoogleSheets,
  };
};
