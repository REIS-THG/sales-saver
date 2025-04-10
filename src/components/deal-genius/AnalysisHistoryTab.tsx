
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Deal, Insight } from "@/types/types";

interface AnalysisHistoryTabProps {
  insights: Insight[];
  deals: Deal[];
}

export const AnalysisHistoryTab = ({ insights, deals }: AnalysisHistoryTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
        <CardDescription>
          Previous deal analysis results and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Deal</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Content</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {insights.map((insight) => (
              <TableRow key={insight.id}>
                <TableCell>
                  {new Date(insight.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {deals.find(d => d.id === insight.deal_id)?.deal_name || 'Unknown'}
                </TableCell>
                <TableCell className="capitalize">
                  {insight.insight_type.replace(/_/g, ' ')}
                </TableCell>
                <TableCell>
                  {insight.confidence_score ? `${insight.confidence_score}%` : 'N/A'}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {insight.content}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
