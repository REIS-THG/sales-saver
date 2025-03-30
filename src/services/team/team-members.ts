
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, User } from "@/types/team-types";

/**
 * Fetches all members of a team
 */
export async function fetchTeamMembers(teamId: string) {
  const { data: membersData, error: membersError } = await supabase
    .from("team_members")
    .select(`
      *,
      user:users(*)
    `)
    .eq("team_id", teamId);

  if (membersError) {
    console.error("Error fetching team members:", membersError);
    throw membersError;
  }

  return membersData.map(member => {
    const subscription_status = member.user && member.user.subscription_status ? 'pro' : 'free' as const;
    
    return {
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role as TeamMember["role"],
      status: member.status as "active" | "inactive" | "pending",
      created_at: member.created_at,
      updated_at: member.updated_at,
      user: member.user ? {
        ...member.user,
        role: member.user.role === 'manager' ? 'manager' : 'sales_rep',
        subscription_status: subscription_status
      } as User : undefined
    };
  });
}

/**
 * Updates a team member's role
 */
export async function updateTeamMemberRole(memberId: string, newRole: string) {
  const { data, error } = await supabase
    .from("team_members")
    .update({ role: newRole })
    .eq("id", memberId)
    .select()
    .single();

  if (error) {
    console.error("Error updating team member role:", error);
    throw error;
  }

  return data;
}

/**
 * Removes a member from a team
 */
export async function removeTeamMember(memberId: string) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId);

  if (error) {
    console.error("Error removing team member:", error);
    throw error;
  }

  return true;
}
