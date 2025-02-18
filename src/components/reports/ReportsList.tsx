
import { ReportCard } from "@/components/reports/ReportCard";
import type { ReportConfiguration } from "@/components/reports/types";

interface ReportsListProps {
  reports: ReportConfiguration[];
  onEdit: (report: ReportConfiguration) => void;
  onDelete: (reportId: string) => void;
  onToggleFavorite: (reportId: string, currentStatus: boolean) => void;
  editingReportId: string | null;
  editingName: string;
  onEditNameChange: (name: string) => void;
  onSaveReportName: () => void;
  onExportExcel: (report: ReportConfiguration) => Promise<void>;
  onExportGoogleSheets: (report: ReportConfiguration) => Promise<void>;
  isFavorites?: boolean;
}

export const ReportsList = ({
  reports,
  onEdit,
  onDelete,
  onToggleFavorite,
  editingReportId,
  editingName,
  onEditNameChange,
  onSaveReportName,
  onExportExcel,
  onExportGoogleSheets,
  isFavorites = false,
}: ReportsListProps) => {
  if (reports.length === 0) {
    return null;
  }

  return (
    <>
      {isFavorites && <h2 className="text-xl font-semibold mb-4">Favorite Reports</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            editingReportId={editingReportId}
            editingName={editingName}
            onEditNameChange={onEditNameChange}
            onSaveReportName={onSaveReportName}
            onExportExcel={onExportExcel}
            onExportGoogleSheets={onExportGoogleSheets}
          />
        ))}
      </div>
    </>
  );
};
