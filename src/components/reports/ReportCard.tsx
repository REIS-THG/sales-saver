
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Save, Star, StarOff, Trash2 } from "lucide-react";
import type { ReportConfiguration } from "@/components/reports/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportActionBar } from "./ReportActionBar";

interface ReportCardProps {
  report: ReportConfiguration;
  onEdit: (report: ReportConfiguration) => void;
  onDelete: (reportId: string) => void;
  onToggleFavorite: (reportId: string, currentStatus: boolean) => void;
  editingReportId: string | null;
  editingName: string;
  onEditNameChange: (name: string) => void;
  onSaveReportName: () => void;
  onExportExcel: (report: ReportConfiguration) => Promise<void>;
  onExportGoogleSheets: (report: ReportConfiguration) => Promise<void>;
  isLoading?: boolean;
}

export const ReportCard = ({
  report,
  onEdit,
  onDelete,
  onToggleFavorite,
  editingReportId,
  editingName,
  onEditNameChange,
  onSaveReportName,
  onExportExcel,
  onExportGoogleSheets,
  isLoading = false
}: ReportCardProps) => {
  return (
    <Card className={`cursor-pointer hover:shadow-lg transition-shadow relative ${isLoading ? 'opacity-50' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {editingReportId === report.id ? (
              <div className="flex gap-2">
                <Input
                  value={editingName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="text-lg font-semibold"
                />
                <Button size="sm" onClick={onSaveReportName}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle>{report.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(report)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <CardDescription>{report.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(report.id, !!report.is_favorite)}
            >
              {report.is_favorite ? (
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <ConfirmDialog
              title="Delete Report"
              description="Are you sure you want to delete this report? This action cannot be undone."
              onConfirm={() => onDelete(report.id)}
              triggerButton={
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onEdit(report)}
        >
          View Report
        </Button>
        
        <ReportActionBar 
          report={report}
          onExportExcel={onExportExcel}
          onExportGoogleSheets={onExportGoogleSheets}
        />
      </CardContent>
    </Card>
  );
};
