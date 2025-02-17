import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Area,
  Pie,
} from "recharts";
import { 
  Settings, 
  Plus, 
  Save,
  Trash2,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Table,
  Star,
  StarOff,
  Pencil,
  ArrowLeft,
  Download
} from "lucide-react";
import * as XLSX from 'xlsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { 
  ReportConfiguration, 
  ReportConfig, 
  CustomField,
  Deal,
  VisualizationType
} from "@/types/types";
import { Input } from "@/components/ui/input";

interface StandardField {
  field_name: string;
  field: string;
  field_type: "text" | "number" | "boolean" | "date";
}

const Reports = () => {
  const [reports, setReports] = useState<ReportConfiguration[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportConfiguration | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const standardFields: StandardField[] = [
    { field: 'amount', field_name: 'Deal Amount', field_type: 'number' },
    { field: 'status', field_name: 'Deal Status', field_type: 'text' },
    { field: 'health_score', field_name: 'Health Score', field_type: 'number' },
    { field: 'created_at', field_name: 'Creation Date', field_type: 'date' },
    { field: 'company_name', field_name: 'Company', field_type: 'text' },
  ];

  const aggregations = [
    { value: 'sum' as const, label: 'Sum' },
    { value: 'avg' as const, label: 'Average' },
    { value: 'count' as const, label: 'Count' },
    { value: 'min' as const, label: 'Minimum' },
    { value: 'max' as const, label: 'Maximum' },
  ];

  const visualizationTypes: { value: VisualizationType; label: string; icon: JSX.Element }[] = [
    { value: 'bar', label: 'Bar Chart', icon: <BarChart2 className="h-4 w-4" /> },
    { value: 'line', label: 'Line Chart', icon: <LineChartIcon className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChartIcon className="h-4 w-4" /> },
    { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
  ];

  useEffect(() => {
    fetchReports();
    fetchCustomFields();
    fetchDeals();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from('report_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedReports: ReportConfiguration[] = (reportsData || []).map(report => ({
        ...report,
        config: report.config as unknown as ReportConfig
      }));

      setReports(typedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reports",
      });
    }
  };

  const fetchCustomFields = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: fieldsData, error } = await supabase
        .from("custom_fields")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      
      const typedCustomFields: CustomField[] = (fieldsData || []).map(field => ({
        ...field,
        field_type: field.field_type as "text" | "number" | "boolean" | "date"
      }));
      
      setCustomFields(typedCustomFields);
    } catch (err) {
      console.error('Error fetching custom fields:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch custom fields",
      });
    }
  };

  const fetchDeals = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const { data: dealsData, error } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const typedDeals: Deal[] = (dealsData || []).map(deal => ({
        ...deal,
        status: (deal.status || 'open') as 'open' | 'stalled' | 'won' | 'lost',
        custom_fields: deal.custom_fields as Record<string, string | number | boolean> | null
      }));

      setDeals(typedDeals);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching deals:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch deals",
      });
      setLoading(false);
    }
  };

  const createReport = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      if (!userId) {
        navigate("/auth");
        return;
      }

      const initialConfig: ReportConfig = {
        dimensions: [],
        metrics: [],
        filters: [],
        visualization: 'bar'
      };

      const newReportData = {
        name: "New Report",
        description: "Custom report description",
        user_id: userId,
        config: JSON.parse(JSON.stringify(initialConfig))
      };

      const { data, error } = await supabase
        .from('report_configurations')
        .insert(newReportData)
        .select()
        .single();

      if (error) throw error;

      const newReport: ReportConfiguration = {
        ...data,
        config: data.config as unknown as ReportConfig
      };

      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      
      toast({
        title: "Success",
        description: "New report created",
      });
    } catch (err) {
      console.error('Error creating report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create report",
      });
    }
  };

  const deleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('report_configurations')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.filter(report => report.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }

      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete report",
      });
    }
  };

  const updateReport = async (reportId: string, updates: Partial<ReportConfiguration>) => {
    try {
      const { data, error } = await supabase
        .from('report_configurations')
        .update({
          ...updates,
          config: JSON.parse(JSON.stringify(updates.config))
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      const updatedReport: ReportConfiguration = {
        ...data,
        config: data.config as unknown as ReportConfig
      };

      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));
      setSelectedReport(updatedReport);

      toast({
        title: "Success",
        description: "Report updated successfully",
      });
    } catch (err) {
      console.error('Error updating report:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report",
      });
    }
  };

  const toggleFavorite = async (reportId: string, currentStatus: boolean) => {
    try {
      const { data, error } = await supabase
        .from('report_configurations')
        .update({ 
          is_favorite: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;

      const updatedReport: ReportConfiguration = {
        ...data,
        config: data.config as unknown as ReportConfig,
        is_favorite: !currentStatus
      };

      setReports(prev => prev.map(report => 
        report.id === reportId ? updatedReport : report
      ));

      toast({
        title: "Success",
        description: `Report ${!currentStatus ? 'added to' : 'removed from'} favorites`,
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorite status",
      });
    }
  };

  const startEditingName = (report: ReportConfiguration) => {
    setEditingReportId(report.id);
    setEditingName(report.name);
  };

  const saveReportName = async () => {
    if (!editingReportId) return;

    try {
      const { data, error } = await supabase
        .from('report_configurations')
        .update({ name: editingName })
        .eq('id', editingReportId)
        .select()
        .single();

      if (error) throw error;

      const updatedReport: ReportConfiguration = {
        ...data,
        config: data.config as unknown as ReportConfig
      };

      setReports(prev => prev.map(report => 
        report.id === editingReportId ? updatedReport : report
      ));

      setEditingReportId(null);
      setEditingName("");

      toast({
        title: "Success",
        description: "Report name updated successfully",
      });
    } catch (err) {
      console.error('Error updating report name:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update report name",
      });
    }
  };

  const generateReportData = (report: ReportConfiguration) => {
    const formattedData = deals.map(deal => {
      const row: Record<string, any> = {};
      
      report.config.dimensions.forEach(dim => {
        if (dim.type === 'standard') {
          row[dim.label] = deal[dim.field as keyof Deal];
        } else if (dim.type === 'custom' && deal.custom_fields) {
          row[dim.label] = deal.custom_fields[dim.field];
        }
      });

      report.config.metrics.forEach(metric => {
        const value = deal[metric.field as keyof Deal];
        if (typeof value === 'number') {
          row[metric.label] = value;
        }
      });

      return row;
    });

    return formattedData;
  };

  const downloadExcel = async (report: ReportConfiguration) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to download reports",
        });
        return;
      }

      const data = generateReportData(report);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = `${userId}/${report.name}_${Date.now()}.xlsx`;
      const { error: uploadError } = await supabase.storage
        .from('report_exports')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('report_exports')
        .getPublicUrl(fileName);

      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = `${report.name}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (err) {
      console.error('Error downloading Excel:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download Excel file",
      });
    }
  };

  const downloadGoogleSheets = async (report: ReportConfiguration) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to download reports",
        });
        return;
      }

      const data = generateReportData(report);
      
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const cell = row[header];
          return typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"`
            : cell;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const fileName = `${userId}/${report.name}_${Date.now()}.csv`;
      const { error: uploadError } = await supabase.storage
        .from('report_exports')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('report_exports')
        .getPublicUrl(fileName);

      const googleSheetsUrl = `https://docs.google.com/spreadsheets/d/create?usp=sheets_web&source=csv&url=${encodeURIComponent(publicUrl)}`;
      window.open(googleSheetsUrl, '_blank');

      toast({
        title: "Success",
        description: "Opening report in Google Sheets",
      });
    } catch (err) {
      console.error('Error exporting to Google Sheets:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export to Google Sheets",
      });
    }
  };

  const renderVisualization = (config: ReportConfig, data: any[]) => {
    const { visualization } = config;
    
    switch (visualization) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="dimension" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <XAxis dataKey="dimension" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="dimension"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#3b82f6"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">Dimension</th>
                  <th className="border p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td className="border p-2">{row.dimension}</td>
                    <td className="border p-2">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  const renderReportCard = (report: ReportConfiguration) => (
    <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {editingReportId === report.id ? (
              <div className="flex gap-2">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="text-lg font-semibold"
                />
                <Button size="sm" onClick={saveReportName}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CardTitle>{report.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditingName(report)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
            <CardDescription>{report.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => downloadExcel(report)}>
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadGoogleSheets(report)}>
                  Open in Google Sheets
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(report.id, !!report.is_favorite)}
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
                deleteReport(report.id);
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
          onClick={() => setSelectedReport(report)}
        >
          View Report
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const favoriteReports = reports.filter(report => report.is_favorite);
  const otherReports = reports.filter(report => !report.is_favorite);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Reports</h1>
          </div>
          <Button onClick={createReport}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>

        {favoriteReports.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Favorite Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {favoriteReports.map((report) => (
                renderReportCard(report)
              ))}
            </div>
          </>
        )}

        <h2 className="text-xl font-semibold mb-4">All Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherReports.map((report) => (
            renderReportCard(report)
          ))}
        </div>

        {selectedReport && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Report Configuration</CardTitle>
                    <CardDescription>Customize your report visualization</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Fields
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Dimensions</h3>
                        <Select
                          onValueChange={(value) => {
                            const allFields = [...standardFields, ...customFields.map(cf => ({
                              field: cf.field_name,
                              field_name: cf.field_name,
                              field_type: cf.field_type
                            }))];
                            const field = allFields.find(f => f.field === value);
                            if (field) {
                              const newDimension = {
                                field: value,
                                type: 'standard' as const,
                                label: field.field_name
                              };
                              updateReport(selectedReport.id, {
                                ...selectedReport,
                                config: {
                                  ...selectedReport.config,
                                  dimensions: [...selectedReport.config.dimensions, newDimension]
                                }
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add dimension" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...standardFields, ...customFields.map(cf => ({
                              field: cf.field_name,
                              field_name: cf.field_name,
                              field_type: cf.field_type
                            }))]
                              .map((field) => (
                                <SelectItem key={field.field} value={field.field}>
                                  {field.field_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2 space-y-2">
                          {selectedReport.config.dimensions.map((dim, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span>{dim.label}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newDimensions = selectedReport.config.dimensions.filter((_, i) => i !== index);
                                  updateReport(selectedReport.id, {
                                    ...selectedReport,
                                    config: {
                                      ...selectedReport.config,
                                      dimensions: newDimensions
                                    }
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Metrics</h3>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => {
                              const allFields = [...standardFields, ...customFields.map(cf => ({
                                field: cf.field_name,
                                field_name: cf.field_name,
                                field_type: cf.field_type
                              }))];
                              const field = allFields.find(f => f.field === value);
                              if (field) {
                                const newMetric = {
                                  field: value,
                                  aggregation: 'sum' as const,
                                  label: `Sum of ${field.field_name}`
                                };
                                updateReport(selectedReport.id, {
                                  ...selectedReport,
                                  config: {
                                    ...selectedReport.config,
                                    metrics: [...selectedReport.config.metrics, newMetric]
                                  }
                                });
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add metric" />
                            </SelectTrigger>
                            <SelectContent>
                              {[...standardFields, ...customFields.map(cf => ({
                                field: cf.field_name,
                                field_name: cf.field_name,
                                field_type: cf.field_type
                              }))]
                                .filter(field => field.field_type === 'number')
                                .map((field) => (
                                  <SelectItem key={field.field} value={field.field}>
                                    {field.field_name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="mt-2 space-y-2">
                          {selectedReport.config.metrics.map((metric, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                <span>{metric.label}</span>
                                <Select
                                  value={metric.aggregation}
                                  onValueChange={(value) => {
                                    const newMetrics = selectedReport.config.metrics.map((m, i) => 
                                      i === index ? { ...m, aggregation: value as any } : m
                                    );
                                    updateReport(selectedReport.id, {
                                      ...selectedReport,
                                      config: {
                                        ...selectedReport.config,
                                        metrics: newMetrics
                                      }
                                    });
                                  }}
                                >
                                  <SelectTrigger className="h-7 w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {aggregations.map((agg) => (
                                      <SelectItem key={agg.value} value={agg.value}>
                                        {agg.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newMetrics = selectedReport.config.metrics.filter((_, i) => i !== index);
                                  updateReport(selectedReport.id, {
                                    ...selectedReport,
                                    config: {
                                      ...selectedReport.config,
                                      metrics: newMetrics
                                    }
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Visualization Type
                    </label>
                    <div className="flex gap-2">
                      {visualizationTypes.map((type) => (
                        <Button
                          key={type.value}
                          variant={selectedReport.config.visualization === type.value ? "default" : "outline"}
                          onClick={() => {
                            updateReport(selectedReport.id, {
                              ...selectedReport,
                              config: {
                                ...selectedReport.config,
                                visualization: type.value
                              }
                            });
                          }}
                        >
                          {type.icon}
                          <span className="ml-2">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border mt-4">
                    {renderVisualization(selectedReport.config, [])}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
