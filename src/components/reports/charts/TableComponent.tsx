
import { memo } from "react";
import { ReportPreviewProps } from "../types";

interface TableComponentProps {
  data: any[];
  config: ReportPreviewProps['config'];
  formatXAxis: (tickItem: string) => string;
}

export const TableComponent = memo(({ data, config, formatXAxis }: TableComponentProps) => {
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
});
