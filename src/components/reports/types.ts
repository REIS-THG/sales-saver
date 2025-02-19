
export interface ReportDimension {
  field: string;
  type: 'standard' | 'custom';
  label: string;
}

export interface ReportMetric {
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  label: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

export type ReportVisualization = 'bar' | 'line' | 'pie' | 'table';

export interface ReportConfig {
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  filters: ReportFilter[];
  visualization: ReportVisualization;
}

export interface ReportConfiguration {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  config: ReportConfig;
  created_at?: string;
  updated_at?: string;
  is_favorite?: boolean;
}

export interface ReportCardProps {
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
}

export interface ReportConfigurationProps {
  report: ReportConfiguration;
  onClose: () => void;
  onUpdate: (reportId: string, updates: Partial<ReportConfiguration>) => void;
  standardFields: { field_name: string; field: string; field_type: "text" | "number" | "boolean" | "date" | "product"; }[];
  customFields: { id: string; field_name: string; field_type: "text" | "number" | "boolean" | "date" | "product"; is_required: boolean; user_id?: string; }[];
  aggregations: { value: 'sum' | 'avg' | 'count' | 'min' | 'max'; label: string; }[];
  visualizationTypes: { value: ReportVisualization; label: string; icon: JSX.Element; }[];
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
