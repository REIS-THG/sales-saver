
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Deal } from "@/types/types";
import * as XLSX from 'xlsx';

interface ExportMenuProps {
  deals: Deal[];
}

export function ExportMenu({ deals }: ExportMenuProps) {
  const exportToExcel = () => {
    const exportData = deals.map(deal => ({
      'Deal Name': deal.deal_name,
      'Company': deal.company_name,
      'Amount': deal.amount,
      'Status': deal.status,
      'Health Score': deal.health_score,
      'Expected Close Date': deal.expected_close_date,
      'Contact Name': `${deal.contact_first_name || ''} ${deal.contact_last_name || ''}`.trim(),
      'Contact Email': deal.contact_email,
      'Company URL': deal.company_url,
      'Notes': deal.notes,
      'Created At': deal.created_at,
      'Last Updated': deal.updated_at
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deals");
    
    XLSX.writeFile(wb, `deals_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const exportData = deals.map(deal => ({
      'Deal Name': deal.deal_name,
      'Company': deal.company_name,
      'Amount': deal.amount,
      'Status': deal.status,
      'Health Score': deal.health_score,
      'Expected Close Date': deal.expected_close_date,
      'Contact Name': `${deal.contact_first_name || ''} ${deal.contact_last_name || ''}`.trim(),
      'Contact Email': deal.contact_email,
      'Company URL': deal.company_url,
      'Notes': deal.notes,
      'Created At': deal.created_at,
      'Last Updated': deal.updated_at
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `deals_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToExcel}>
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToCSV}>
          Export to CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
