
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches report access permissions for a team
 */
export async function getTeamReportAccess(teamId: string) {
  try {
    const { data, error } = await supabase
      .from("team_report_access")
      .select("report_id")
      .eq("team_id", teamId);

    if (error) throw error;
    
    return data.map(item => item.report_id);
  } catch (err) {
    console.error("Error fetching team report access:", err);
    throw err;
  }
}

/**
 * Updates report access permissions for a team
 */
export async function updateTeamReportAccess(teamId: string, reportIds: string[]) {
  try {
    // First delete all existing access entries
    const { error: deleteError } = await supabase
      .from("team_report_access")
      .delete()
      .eq("team_id", teamId);
      
    if (deleteError) throw deleteError;
    
    // If there are no reports to add, we're done
    if (reportIds.length === 0) return true;
    
    // Insert new access entries
    const accessEntries = reportIds.map(reportId => ({
      team_id: teamId,
      report_id: reportId
    }));
    
    const { error: insertError } = await supabase
      .from("team_report_access")
      .insert(accessEntries);
      
    if (insertError) throw insertError;
    
    return true;
  } catch (err) {
    console.error("Error updating team report access:", err);
    throw err;
  }
}
