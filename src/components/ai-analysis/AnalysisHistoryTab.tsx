
import { Deal, Insight } from "@/types/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AnalysisHistoryTabProps {
  insights: Insight[];
  deals: Deal[];
}

export function AnalysisHistoryTab({ insights, deals }: AnalysisHistoryTabProps) {
  // Sort insights by date (newest first)
  const sortedInsights = [...insights].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'risk': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'opportunity': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'action_item': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <History className="h-5 w-5 text-purple-500" />
          Analysis History
        </CardTitle>
        <CardDescription>
          Review previous analysis results and track deal progress over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedInsights.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[180px]">Deal</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-[100px] text-right">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInsights.map((insight) => {
                  const dealName = deals.find(d => d.id === insight.deal_id)?.deal_name || 'Unknown';
                  
                  return (
                    <TableRow key={insight.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {format(new Date(insight.created_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium truncate max-w-[120px]">{dealName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getInsightTypeColor(insight.insight_type)}>
                          {insight.insight_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {insight.content}
                      </TableCell>
                      <TableCell className="text-right">
                        {insight.confidence_score ? `${insight.confidence_score}%` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <History className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No history yet</h3>
            <p className="text-gray-500 max-w-sm">
              Run your first analysis to start tracking insights and recommendations over time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
