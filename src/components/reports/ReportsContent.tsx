
import { ReportsList } from "./ReportsList";
import type { ReportConfiguration as ReportConfigType } from "./types";

interface ReportsContentProps {
  reports: ReportConfigType[];
  onEdit: (report: ReportConfigType) => void;
  onDelete: (reportId: string) => Promise<boolean>;
  onToggleFavorite: (reportId: string, currentStatus: boolean) => Promise<boolean>;
  editingReportId: string | null;
  editingName: string;
  onEditNameChange: (name: string) => void;
  onSaveReportName: () => Promise<void>;
  onExportExcel: (report: ReportConfigType) => Promise<void>;
  onExportGoogleSheets: (report: ReportConfigType) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  actionLoading: { [key: string]: boolean };
}

export const ReportsContent = ({
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
  currentPage,
  totalPages,
  onPageChange,
  actionLoading,
}: ReportsContentProps) => {
  const favoriteReports = reports.filter(report => report.is_favorite);
  const otherReports = reports.filter(report => !report.is_favorite);

  return (
    <>
      <ReportsList
        reports={favoriteReports}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        editingReportId={editingReportId}
        editingName={editingName}
        onEditNameChange={onEditNameChange}
        onSaveReportName={onSaveReportName}
        onExportExcel={onExportExcel}
        onExportGoogleSheets={onExportGoogleSheets}
        isFavorites={true}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        actionLoading={actionLoading}
      />

      <h2 className="text-xl font-semibold mb-4 dark:text-white mt-8">All Reports</h2>
      <ReportsList
        reports={otherReports}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        editingReportId={editingReportId}
        editingName={editingName}
        onEditNameChange={onEditNameChange}
        onSaveReportName={onSaveReportName}
        onExportExcel={onExportExcel}
        onExportGoogleSheets={onExportGoogleSheets}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        actionLoading={actionLoading}
      />
    </>
  );
};
