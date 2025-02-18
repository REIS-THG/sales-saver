
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BulkImportDealsProps {
  onImportComplete: () => void;
  teamId?: string;
  trigger?: React.ReactNode;
}

export function BulkImportDeals({ onImportComplete, teamId, trigger }: BulkImportDealsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importId, setImportId] = useState<string | null>(null);
  const { toast } = useToast();

  const checkImportProgress = async (importId: string) => {
    const { data } = await supabase
      .from('bulk_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (data) {
      const progressPercent = data.total_records 
        ? Math.round((data.processed_records / data.total_records) * 100)
        : 0;
      
      setProgress(progressPercent);

      if (data.status === 'completed') {
        setImporting(false);
        toast({
          title: "Import completed",
          description: `Successfully imported ${data.success_count} deals. ${data.error_count} errors.`,
          variant: data.error_count > 0 ? "destructive" : "default",
        });
        onImportComplete();
        setIsOpen(false);
      } else {
        setTimeout(() => checkImportProgress(importId), 1000);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to import deals",
        variant: "destructive",
      });
      return;
    }

    formData.append('userId', user.id);
    if (teamId) {
      formData.append('teamId', teamId);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-deal-import`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start import');
      }

      setImportId(result.importId);
      checkImportProgress(result.importId);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import deals",
        variant: "destructive",
      });
      setImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="ml-2">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Deals</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>CSV Format Required</AlertTitle>
            <AlertDescription>
              Please ensure your CSV file includes these columns in order:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Deal Name</li>
                <li>Company Name</li>
                <li>Amount</li>
                <li>Status (open/won/lost/stalled)</li>
                <li>Contact Email</li>
                <li>Contact First Name</li>
                <li>Contact Last Name</li>
                <li>Company URL</li>
                <li>Notes</li>
                <li>Expected Close Date (YYYY-MM-DD)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {importing ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Importing deals...</div>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
