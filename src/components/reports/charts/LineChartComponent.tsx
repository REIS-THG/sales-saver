
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from "recharts";
import { memo } from "react";
import { ReportPreviewProps } from "../types";

interface LineChartComponentProps {
  data: any[];
  config: ReportPreviewProps['config'];
  formatXAxis: (tickItem: string) => string;
}

export const LineChartComponent = memo(({ data, config, formatXAxis }: LineChartComponentProps) => (
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
