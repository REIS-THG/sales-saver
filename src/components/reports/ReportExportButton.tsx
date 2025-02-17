
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Table, Loader2 } from "lucide-react";
import { ReportExportButtonProps } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ReportExportButton = ({ report, onExportExcel, onExportGoogleSheets }: ReportExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await onExportExcel(report);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGoogleSheets = async () => {
    setIsExporting(true);
    try {
      await onExportGoogleSheets(report);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                disabled={isExporting}
                className="relative"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={handleExportExcel}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleExportGoogleSheets}
              disabled={isExporting}
              className="cursor-pointer"
            >
              <Table className="mr-2 h-4 w-4" />
              Open in Google Sheets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent>
          <p>Export report data</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
