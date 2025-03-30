
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the current user's role in a team
 */
export async function getUserTeamRole(teamId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('get-user-team-role', {
      body: { teamId }
    });
    
    if (error) {
      console.error('Error getting user team role:', error);
      return null;
    }
    
    return data?.role || null;
  } catch (err) {
    console.error('Error getting user team role:', err);
    return null;
  }
}
