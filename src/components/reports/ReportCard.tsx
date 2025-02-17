
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Save, Star, StarOff, Trash2 } from "lucide-react";
import { ReportCardProps } from "./types";
import { ReportExportButton } from "./ReportExportButton";

export const ReportCard = ({
  report,
  onEdit,
  onDelete,
  onToggleFavorite,
  editingReportId,
  editingName,
  onEditNameChange,
  onSaveReportName
}: ReportCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
            <ReportExportButton report={report} />
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
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(report.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onEdit(report)}
        >
          View Report
        </Button>
      </CardContent>
    </Card>
  );
};
