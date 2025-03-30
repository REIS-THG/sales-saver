
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, LoaderCircle } from "lucide-react";

interface TeamReportsAccessProps {
  teamId: string;
  canManage: boolean;
}

interface ReportAccess {
  reportId: string;
  reportName: string;
  hasAccess: boolean;
}

export function TeamReportsAccess({ teamId, canManage }: TeamReportsAccessProps) {
  const [reportAccess, setReportAccess] = useState<ReportAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportsAccess();
  }, [teamId]);

  const fetchReportsAccess = async () => {
    setLoading(true);
    try {
      // Fetch all reports
      const { data: reports, error: reportsError } = await supabase
        .from('report_configurations')
        .select('id, name');

      if (reportsError) throw reportsError;

      // Fetch team report access
      const { data: teamReports, error: teamReportsError } = await supabase
        .from('team_report_access')
        .select('report_id')
        .eq('team_id', teamId);

      if (teamReportsError) throw teamReportsError;

      // Create a set of report IDs that the team has access to
      const accessSet = new Set(teamReports?.map(tr => tr.report_id) || []);

      // Create the report access list
      const access = reports?.map(report => ({
        reportId: report.id,
        reportName: report.name,
        hasAccess: accessSet.has(report.id)
      })) || [];

      setReportAccess(access);
    } catch (error) {
      console.error('Error fetching report access:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch report access information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = (reportId: string) => {
    if (!canManage) return;
    
    setReportAccess(prev => 
      prev.map(access => 
        access.reportId === reportId 
          ? { ...access, hasAccess: !access.hasAccess } 
          : access
      )
    );
  };

  const saveChanges = async () => {
    if (!canManage) return;
    
    setSaving(true);
    try {
      // Delete all existing access entries for this team
      const { error: deleteError } = await supabase
        .from('team_report_access')
        .delete()
        .eq('team_id', teamId);

      if (deleteError) throw deleteError;

      // Insert new access entries
      const accessEntries = reportAccess
        .filter(access => access.hasAccess)
        .map(access => ({
          team_id: teamId,
          report_id: access.reportId
        }));

      if (accessEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('team_report_access')
          .insert(accessEntries);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success',
        description: 'Report access settings saved successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving report access:', error);
      toast({
        title: 'Error',
        description: 'Failed to save report access settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (reportAccess.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <FileText className="h-12 w-12 text-gray-400" />
          <div className="text-center">
            <h3 className="text-lg font-medium">No Reports Available</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create reports first to manage team access.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Manage Report Access</h3>
        {canManage && (
          <Button 
            onClick={saveChanges} 
            disabled={saving}
            variant="default"
          >
            {saving ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Report Name</TableHead>
            <TableHead className="w-[100px] text-right">Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportAccess.map((access) => (
            <TableRow key={access.reportId}>
              <TableCell className="font-medium">{access.reportName}</TableCell>
              <TableCell className="text-right">
                <Switch 
                  checked={access.hasAccess} 
                  onCheckedChange={() => toggleAccess(access.reportId)}
                  disabled={!canManage}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <p className="text-sm text-gray-500 mt-2">
        {canManage 
          ? "Toggle switches to grant or revoke team access to reports. Don't forget to save your changes."
          : "You need admin or owner permissions to manage report access."}
      </p>
    </div>
  );
}
