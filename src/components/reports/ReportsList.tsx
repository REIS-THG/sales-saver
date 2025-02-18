
import { Button } from "@/components/ui/button";
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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  actionLoading: {[key: string]: boolean};
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
  currentPage,
  totalPages,
  onPageChange,
  actionLoading,
}: ReportsListProps) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reports found.</p>
      </div>
    );
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
            isLoading={actionLoading[report.id]}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
};
