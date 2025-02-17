
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
  Table
} from "lucide-react";
import type { 
  ReportConfiguration, 
  ReportConfig, 
  CustomField,
  Deal,
  VisualizationType
} from "@/types/types";

const Reports = () => {
  const [reports, setReports] = useState<ReportConfiguration[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportConfiguration | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const standardFields = [
    { field: 'amount', label: 'Deal Amount', type: 'number' },
    { field: 'status', label: 'Deal Status', type: 'text' },
    { field: 'health_score', label: 'Health Score', type: 'number' },
    { field: 'created_at', label: 'Creation Date', type: 'date' },
    { field: 'company_name', label: 'Company', type: 'text' },
  ];

  const aggregations = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
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

      // Transform the data to match our ReportConfiguration type
      const typedReports: ReportConfiguration[] = (reportsData || []).map(report => ({
        ...report,
        config: report.config as unknown as ReportConfig // Cast the JSON to our type
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

      // Transform the data to match our Deal type
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
        config: initialConfig
      };

      const { data, error } = await supabase
        .from('report_configurations')
        .insert(newReportData)
        .select()
        .single();

      if (error) throw error;

      // Transform the returned data to match our ReportConfiguration type
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reports</h1>
          <Button onClick={createReport}>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{report.name}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Report preview or summary could go here */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedReport(report)}
                >
                  View Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedReport && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>Customize your report visualization</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Report configuration UI will go here */}
                <div className="space-y-4">
                  {/* Visualization type selector */}
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
                            setSelectedReport({
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

                  {/* Placeholder for the actual visualization */}
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
