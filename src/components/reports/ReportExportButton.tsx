
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { ReportExportButtonProps } from "./types";

export const ReportExportButton = ({ report, onExportExcel, onExportGoogleSheets }: ReportExportButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onExportExcel(report)}>
          Download Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExportGoogleSheets(report)}>
          Open in Google Sheets
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
