
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
import { ReportPreviewProps } from "./types";

export const ReportPreview = ({ config, data }: ReportPreviewProps) => {
  switch (config.visualization) {
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
