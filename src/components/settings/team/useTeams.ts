
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Team, TeamMember, User } from "@/types/types";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, (TeamMember & { user: User })[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeams = useCallback(async () => {
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*");

      if (teamsError) throw teamsError;

      const teams = teamsData as Team[];
      setTeams(teams);

      const membersPromises = teams.map(async (team) => {
        const { data: membersData, error: membersError } = await supabase
          .from("team_members")
          .select(`
            *,
            user:users(*)
          `)
          .eq("team_id", team.id);

        if (membersError) {
          console.error("Error fetching team members:", membersError);
          throw membersError;
        }

        const transformedMembers = (membersData || []).map(member => ({
          id: member.id,
          team_id: member.team_id,
          user_id: member.user_id,
          role: member.role as TeamMember["role"],
          created_at: member.created_at,
          updated_at: member.updated_at,
          user: {
            ...member.user,
            role: member.user.role === 'manager' ? 'manager' : 'sales_rep'
          } as User
        }));

        return { teamId: team.id, members: transformedMembers };
      });

      const membersResults = await Promise.all(membersPromises);
      const membersMap: Record<string, (TeamMember & { user: User })[]> = {};
      membersResults.forEach(({ teamId, members }) => {
        membersMap[teamId] = members;
      });

      setTeamMembers(membersMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
      });
      setLoading(false);
    }
  }, [toast]);

  const createTeam = async (teamName: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a team.",
        });
        return false;
      }

      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert([
          {
            name: teamName.trim(),
            owner_id: userData.user.id,
          },
        ])
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: teamData.id,
            user_id: userData.user.id,
            role: "owner",
          },
        ]);

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: "Team created successfully.",
      });
      fetchTeams();
      return true;
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create team. Please try again.",
      });
      return false;
    }
  };

  const addTeamMember = async (email: string, teamId: string, role: TeamMember["role"]) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Adding team member:', { email: normalizedEmail, teamId, role });
      
      // Query users table with case-insensitive comparison
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not found. Please check the email address.",
        });
        return false;
      }

      console.log('Found user:', userData);

      // Check for existing membership
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "User is already a member of this team.",
        });
        return false;
      }

      // Add team member
      console.log('Adding new team member:', { 
        team_id: teamId, 
        user_id: userData.user_id,
        role 
      });
      
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

      toast({
        title: "Success",
        description: "Team member added successfully.",
      });
      fetchTeams();
      return true;
    } catch (error) {
      console.error('Error in addTeamMember:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add team member. Please try again.",
      });
      return false;
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error: membersError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId);

      if (membersError) throw membersError;

      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (teamError) throw teamError;

      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });
      fetchTeams();
      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team. Please try again.",
      });
      return false;
    }
  };

  const removeTeamMember = async (teamId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully.",
      });
      fetchTeams();
      return true;
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member. Please try again.",
      });
      return false;
    }
  };

  return {
    teams,
    teamMembers,
    loading,
    fetchTeams,
    createTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
  };
}
