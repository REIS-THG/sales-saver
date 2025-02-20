
import { supabase } from "@/integrations/supabase/client";
import { Team, TeamMember, User } from "@/types/types";

export async function fetchUserTeams() {
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("*");

  if (teamsError) {
    console.error("Error fetching teams:", teamsError);
    throw teamsError;
  }

  return teamsData as Team[];
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
    const subscription_status = member.user.subscription_status ? 'pro' : 'free' as const;
    
    return {
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role as TeamMember["role"],
      created_at: member.created_at,
      updated_at: member.updated_at,
      user: {
        ...member.user,
        role: member.user.role === 'manager' ? 'manager' : 'sales_rep',
        subscription_status: subscription_status
      } as User
    };
  });
}

export async function createTeam(teamName: string, userId: string) {
  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .insert([
      {
        name: teamName.trim(),
        owner_id: userId,
      },
    ])
    .select()
    .single();

  if (teamError) {
    console.error("Error creating team:", teamError);
    throw teamError;
  }

  const { error: memberError } = await supabase
    .from("team_members")
    .insert([
      {
        team_id: teamData.id,
        user_id: userId,
        role: "owner",
      },
    ]);

  if (memberError) {
    console.error("Error adding team member:", memberError);
    throw memberError;
  }

  return teamData;
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

export async function addTeamMember(email: string, teamId: string, role: TeamMember["role"]) {
  const normalizedEmail = email.trim().toLowerCase();
  
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, user_id, email")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (userError) {
    console.error('Error fetching user:', userError);
    throw userError;
  }

  if (!userData) {
    throw new Error("User not found");
  }

  const { data: existingMember, error: existingMemberError } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", userData.user_id)
    .maybeSingle();

  if (existingMemberError) {
    console.error('Error checking existing membership:', existingMemberError);
    throw existingMemberError;
  }

  if (existingMember) {
    throw new Error("User is already a member of this team");
  }

  const { error: memberError } = await supabase
    .from("team_members")
    .insert([
      {
        team_id: teamId,
        user_id: userData.user_id,
        role: role,
      },
    ]);

  if (memberError) {
    console.error('Error adding team member:', memberError);
    throw memberError;
  }

  return true;
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
