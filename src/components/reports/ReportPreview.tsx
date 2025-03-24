import {
  BarChart,
  LineChart,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ReportPreviewProps } from "./types";
import { ErrorBoundary } from "../ui/error-boundary";
import { useMemo, memo } from "react";
import { ReportErrorDisplay } from "./ReportErrorDisplay";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Memoized chart components for better performance with large datasets
const MemoizedBarChart = memo(({ data, config, formatXAxis }: { 
  data: any[], 
  config: ReportPreviewProps['config'],
  formatXAxis: (tickItem: string) => string
}) => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
      <XAxis 
        dataKey="dimension" 
        tickFormatter={formatXAxis}
        angle={-45}
        textAnchor="end"
        height={70}
      />
      <YAxis />
      <Tooltip content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow">
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
      }} />
      <Legend />
      <Bar 
        dataKey="value" 
        name={config.metrics[0]?.label || "Value"} 
        fill="#3b82f6"
      >
        {data.slice(0, 20).map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
));

const MemoizedLineChart = memo(({ data, config, formatXAxis }: { 
  data: any[], 
  config: ReportPreviewProps['config'],
  formatXAxis: (tickItem: string) => string
}) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
      <XAxis 
        dataKey="dimension" 
        tickFormatter={formatXAxis}
        angle={-45}
        textAnchor="end"
        height={70}
      />
      <YAxis />
      <Tooltip content={({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow">
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
      }} />
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
));

const MemoizedPieChart = memo(({ data, config }: { 
  data: any[], 
  config: ReportPreviewProps['config']
}) => (
  <ResponsiveContainer width="100%" height={400}>
    <PieChart>
      <Pie
        data={data.slice(0, 10)} // Limit to 10 slices for performance and readability
        dataKey="value"
        nameKey="dimension"
        cx="50%"
        cy="50%"
        outerRadius={150}
        label={({ dimension, value, percent }) => 
          `${dimension}: ${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`
        }
      >
        {data.slice(0, 10).map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => value.toLocaleString()} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
));

export const ReportPreview = ({ config, data, onRetry }: ReportPreviewProps & { onRetry?: () => void }) => {
  // If no dimensions or metrics have been selected, or data is empty
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border rounded p-4 bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No data available. Please select dimensions and metrics.</p>
      </div>
    );
  }

  // Memoize the formatXAxis function to prevent unnecessary re-renders
  const formatXAxis = useMemo(() => {
    return (tickItem: string) => {
      if (!tickItem) return '';
      try {
        // Check if the tickItem is a valid date
        const date = parseISO(tickItem);
        return format(date, 'MMM d');
      } catch {
        // For long text items, truncate to keep chart readable
        return tickItem.length > 15 ? `${tickItem.substring(0, 15)}...` : tickItem;
      }
    };
  }, []);

  // Virtualize large tables by only rendering visible rows
  const renderTable = useMemo(() => {
    // Only render first 100 rows for performance
    const visibleData = data.slice(0, 100);
    
    return (
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm">
            <tr>
              <th className="border p-2 text-left">{config.dimensions[0]?.label || "Dimension"}</th>
              <th className="border p-2 text-left">{config.metrics[0]?.label || "Value"}</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/50' : ''}>
                <td className="border p-2">{formatXAxis(row.dimension)}</td>
                <td className="border p-2">
                  {typeof row.value === 'number' ? row.value.toLocaleString() : row.value}
                </td>
              </tr>
            ))}
            {data.length > 100 && (
              <tr>
                <td colSpan={2} className="text-center p-2 text-sm text-gray-500 border">
                  Showing 100 of {data.length} rows for performance
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }, [data, config.dimensions, config.metrics, formatXAxis]);

  return (
    <ErrorBoundary
      fallback={
        <ReportErrorDisplay 
          error="An error occurred while rendering the report. Please try again with different settings."
          onRetry={onRetry || (() => {})}
        />
      }
    >
      {(() => {
        switch (config.visualization) {
          case 'bar':
            return <MemoizedBarChart data={data} config={config} formatXAxis={formatXAxis} />;
          case 'line':
            return <MemoizedLineChart data={data} config={config} formatXAxis={formatXAxis} />;
          case 'pie':
            return <MemoizedPieChart data={data} config={config} />;
          case 'table':
            return renderTable;
          default:
            return (
              <div className="h-64 flex items-center justify-center border rounded p-4 bg-gray-50 dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">Please select a visualization type.</p>
              </div>
            );
        }
      })()}
    </ErrorBoundary>
  );
};
