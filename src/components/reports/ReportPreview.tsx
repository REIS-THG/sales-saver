
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
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ReportPreviewProps } from "./types";
import { ErrorBoundary } from "../ui/error-boundary";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportPreview = ({ config, data }: ReportPreviewProps) => {
  // If no dimensions or metrics have been selected, or data is empty
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border rounded p-4 bg-gray-50">
        <p className="text-gray-500">No data available. Please select dimensions and metrics.</p>
      </div>
    );
  }

  const formatXAxis = (tickItem: string) => {
    if (!tickItem) return '';
    try {
      // Check if the tickItem is a valid date
      const date = parseISO(tickItem);
      return format(date, 'MMM d');
    } catch {
      return tickItem;
    }
  };

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="text-sm font-medium">{formatXAxis(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ErrorBoundary>
      {(() => {
        switch (config.visualization) {
          case 'bar':
            return (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="dimension" 
                    tickFormatter={formatXAxis}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend />
                  <Bar dataKey="value" name={config.metrics[0]?.label || "Value"} fill="#3b82f6">
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            );
          case 'line':
            return (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="dimension" 
                    tickFormatter={formatXAxis}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip content={renderCustomTooltip} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name={config.metrics[0]?.label || "Value"}
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
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
                    label={(entry) => `${entry.dimension}: ${entry.value}`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={renderCustomTooltip} />
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
                      <th className="border p-2">{config.dimensions[0]?.label || "Dimension"}</th>
                      <th className="border p-2">{config.metrics[0]?.label || "Value"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index}>
                        <td className="border p-2">{formatXAxis(row.dimension)}</td>
                        <td className="border p-2">{typeof row.value === 'number' ? row.value.toLocaleString() : row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return (
              <div className="h-64 flex items-center justify-center border rounded p-4 bg-gray-50">
                <p className="text-gray-500">Please select a visualization type.</p>
              </div>
            );
        }
      })()}
    </ErrorBoundary>
  );
};
