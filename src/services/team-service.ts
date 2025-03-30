
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

export async function fetchTeamActivity(teamId: string) {
  try {
    // In a real implementation, you would create a team_activity_log table
    // For now, we'll return mock data
    return [];
  } catch (err) {
    console.error("Error fetching team activity:", err);
    throw err;
  }
}

export async function exportTeamReport(teamId: string) {
  try {
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();
      
    if (teamError) throw teamError;
    
    const { data: members, error: membersError } = await supabase
      .from("team_members")
      .select(`
        *,
        user:users(*)
      `)
      .eq("team_id", teamId);
      
    if (membersError) throw membersError;
    
    const { data: invitations, error: invitationsError } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("team_id", teamId)
      .eq("status", "pending");
      
    if (invitationsError) throw invitationsError;
    
    return {
      team,
      members,
      invitations
    };
  } catch (err) {
    console.error("Error exporting team report:", err);
    throw err;
  }
}
