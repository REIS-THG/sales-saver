
import { ReportConfiguration } from "./ReportConfiguration";
import type { ReportConfiguration as ReportConfigType } from "./types";
import { BarChart2, PieChart, LineChart, Table } from "lucide-react";

interface ReportEditorProps {
  editingReportId: string | null;
  reports: ReportConfigType[];
  onUpdate: (reportId: string, updates: Partial<ReportConfigType>) => Promise<void>;
  onClose: () => void;
}

export const ReportEditor = ({ editingReportId, reports, onUpdate, onClose }: ReportEditorProps) => {
  if (!editingReportId || !reports.find(r => r.id === editingReportId)) {
    return null;
  }

  return (
    <ReportConfiguration
      report={reports.find(r => r.id === editingReportId)!}
      onClose={onClose}
      onUpdate={onUpdate}
      standardFields={[
        { field: 'created_at', field_name: 'Creation Date', field_type: 'date' },
        { field: 'expected_close_date', field_name: 'Expected Close Date', field_type: 'date' },
        { field: 'amount', field_name: 'Deal Amount', field_type: 'number' },
        { field: 'status', field_name: 'Deal Status', field_type: 'text' },
        { field: 'health_score', field_name: 'Health Score', field_type: 'number' },
        { field: 'company_name', field_name: 'Company', field_type: 'text' },
        { field: 'deal_name', field_name: 'Deal Name', field_type: 'text' },
        { field: 'contact_first_name', field_name: 'Contact First Name', field_type: 'text' },
        { field: 'contact_last_name', field_name: 'Contact Last Name', field_type: 'text' },
        { field: 'contact_email', field_name: 'Contact Email', field_type: 'text' },
      ]}
      customFields={[]}
      aggregations={[
        { value: 'sum', label: 'Sum' },
        { value: 'avg', label: 'Average' },
        { value: 'count', label: 'Count' },
        { value: 'min', label: 'Minimum' },
        { value: 'max', label: 'Maximum' },
      ]}
      visualizationTypes={[
        { value: 'bar', label: 'Bar Chart', icon: <BarChart2 className="h-4 w-4" /> },
        { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
        { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
        { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
      ]}
    />
  );
};
