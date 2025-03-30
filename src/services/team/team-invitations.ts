
import { supabase } from "@/integrations/supabase/client";
import { TeamInvitation, TeamMember } from "@/types/team-types";

/**
 * Fetches all pending invitations for a team
 */
export async function fetchTeamInvitations(teamId: string) {
  const { data, error } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", teamId)
    .eq("status", "pending");

  if (error) {
    console.error("Error fetching team invitations:", error);
    throw error;
  }

  return data as TeamInvitation[];
}

/**
 * Invites a new member to a team
 */
export async function inviteTeamMember(teamId: string, email: string, role: TeamMember["role"]) {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("Unauthorized");
  }
  
  const { error } = await supabase
    .from("team_invitations")
    .insert([
      {
        team_id: teamId,
        email: email.toLowerCase().trim(),
        role: role,
        invited_by: userData.user.id,
      },
    ]);

  if (error) {
    console.error('Error inviting team member:', error);
    throw error;
  }

  return true;
}

/**
 * Cancels a pending invitation
 */
export async function cancelTeamInvitation(invitationId: string) {
  const { error } = await supabase
    .from("team_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) {
    console.error("Error canceling team invitation:", error);
    throw error;
  }

  return true;
}

/**
 * Accepts a team invitation
 */
export async function acceptTeamInvitation(teamId: string, email: string) {
  try {
    const { data, error } = await supabase.functions.invoke('accept-team-invitation', {
      body: { email, teamId }
    });
    
    if (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
    
    return data?.success || false;
  } catch (err) {
    console.error('Error accepting invitation:', err);
    throw err;
  }
}
