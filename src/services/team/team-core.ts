
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team-types";

/**
 * Fetches all teams that the current user belongs to, either as owner or member
 */
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

/**
 * Creates a new team with the given name
 */
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

/**
 * Updates an existing team with the provided updates
 */
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

/**
 * Deletes a team by ID
 */
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
