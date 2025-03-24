
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share, Download, FileText, ChevronDown } from "lucide-react";
import type { ReportConfiguration } from "./types";
import { ShareReportDialog } from "./sharing/ShareReportDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ReportActionBarProps {
  report: ReportConfiguration;
  onExportExcel: (report: ReportConfiguration) => Promise<void>;
  onExportGoogleSheets: (report: ReportConfiguration) => Promise<void>;
}

export function ReportActionBar({ report, onExportExcel, onExportGoogleSheets }: ReportActionBarProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (type: 'excel' | 'sheets') => {
    try {
      setIsExporting(true);
      if (type === 'excel') {
        await onExportExcel(report);
      } else {
        await onExportGoogleSheets(report);
      }
    } catch (error) {
      console.error(`Error exporting to ${type}:`, error);
      toast({
        variant: "destructive",
        title: `Export failed`,
        description: `There was an error exporting to ${type === 'excel' ? 'Excel' : 'Google Sheets'}. Please try again.`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsShareDialogOpen(true)}
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              Export
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileText className="h-4 w-4 mr-2" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('sheets')}>
              <FileText className="h-4 w-4 mr-2" />
              Export to Google Sheets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ShareReportDialog 
        report={report}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </>
  );
}
