
import { StandardField, VisualizationType } from "@/types/types";

export interface ReportCardProps {
  report: ReportConfiguration;
  onEdit: (report: ReportConfiguration) => void;
  onDelete: (reportId: string) => void;
  onToggleFavorite: (reportId: string, currentStatus: boolean) => void;
  editingReportId: string | null;
  editingName: string;
  onEditNameChange: (name: string) => void;
  onSaveReportName: () => void;
}

export interface ReportConfigurationProps {
  report: ReportConfiguration;
  onClose: () => void;
  onUpdate: (reportId: string, updates: Partial<ReportConfiguration>) => void;
  standardFields: StandardField[];
  customFields: CustomField[];
  aggregations: { value: 'sum' | 'avg' | 'count' | 'min' | 'max'; label: string; }[];
  visualizationTypes: { value: VisualizationType; label: string; icon: JSX.Element; }[];
}

export interface ReportPreviewProps {
  config: ReportConfig;
  data: any[];
}

export interface ReportExportButtonProps {
  report: ReportConfiguration;
  onExportExcel: (report: ReportConfiguration) => Promise<void>;
  onExportGoogleSheets: (report: ReportConfiguration) => Promise<void>;
}
