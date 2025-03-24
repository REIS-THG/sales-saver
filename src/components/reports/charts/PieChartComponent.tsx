
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { memo } from "react";
import { ReportPreviewProps } from "../types";
import { CHART_COLORS } from "../constants/chartColors";

interface PieChartComponentProps {
  data: any[];
  config: ReportPreviewProps['config'];
}

export const PieChartComponent = memo(({ data, config }: PieChartComponentProps) => (
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
          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => value.toLocaleString()} />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
));
