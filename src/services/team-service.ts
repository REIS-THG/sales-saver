
import { supabase } from "@/integrations/supabase/client";
import { Team, TeamMember, User, TeamInvitation } from "@/types/types";

export async function fetchUserTeams() {
  // Fetch teams where user is owner
  const { data: ownedTeams, error: ownedError } = await supabase
    .from("teams")
    .select("*");

  if (ownedError) {
    console.error("Error fetching owned teams:", ownedError);
    throw ownedError;
  }

  // Fetch teams where user is a member
  const { data: memberTeams, error: memberError } = await supabase
    .from("team_members")
    .select("teams(*)")
    .eq("status", "active");

  if (memberError) {
    console.error("Error fetching member teams:", memberError);
    throw memberError;
  }

  // Extract teams from the member teams response
  const memberTeamsData = memberTeams
    .filter(item => item.teams)
    .map(item => item.teams);

  // Combine and deduplicate
  const allTeams = [...ownedTeams, ...memberTeamsData];
  const uniqueTeams = Array.from(
    new Map(allTeams.map(team => [team.id, team])).values()
  );

  return uniqueTeams as Team[];
}

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

export async function createTeam(teamName: string) {
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .insert([
      {
        name: teamName.trim(),
      },
    ])
    .select()
    .single();

  if (teamError) {
    console.error("Error creating team:", teamError);
    throw teamError;
  }

  return teamData as Team;
}

export async function updateTeam(teamId: string, updates: Partial<Team>) {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId)
    .select()
    .single();

  if (error) {
    console.error("Error updating team:", error);
    throw error;
  }

  return data as Team;
}

export async function deleteTeam(teamId: string) {
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) {
    console.error("Error deleting team:", error);
    throw error;
  }

  return true;
}

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

export async function acceptTeamInvitation(teamId: string, email: string) {
  const { data, error } = await supabase.rpc(
    'accept_team_invitation',
    { p_email: email, p_team_id: teamId }
  );
  
  if (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
  
  return data;
}

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

export async function getUserTeamRole(teamId: string) {
  const { data, error } = await supabase.rpc(
    'get_user_team_role',
    { p_team_id: teamId }
  );
  
  if (error) {
    console.error('Error getting user team role:', error);
    return null;
  }
  
  return data;
}
