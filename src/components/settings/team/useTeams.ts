
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
      if (!userData.user) return;

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

  const addTeamMember = async (email: string, teamId: string, role: TeamMember["role"]) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Step 1: Looking up user by email:', normalizedEmail);
      
      // First, log all users to see what we have
      const { data: allUsers, error: allUsersError } = await supabase
        .from("users")
        .select("id, user_id, email, full_name");
      
      console.log('All users in the database:', allUsers);
      
      // Query users table with case-insensitive comparison
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, user_id, email, full_name")
        .ilike("email", normalizedEmail)
        .maybeSingle();

      if (userError) {
        console.error('Step 1 Error - Failed to fetch user:', userError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to lookup user. Please try again.",
        });
        return false;
      }

      if (!userData) {
        console.log('Step 1 Error - No user found with email:', normalizedEmail);
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not found. Please check the email address.",
        });
        return false;
      }

      console.log('Step 2: Found user:', userData);

      // Check for existing membership using user_id
      console.log('Step 3: Checking if user is already a team member. User ID:', userData.user_id);
      const { data: existingMember, error: existingMemberError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", userData.user_id)
        .maybeSingle();

      if (existingMemberError) {
        console.error('Step 3 Error - Failed to check existing membership:', existingMemberError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify team membership. Please try again.",
        });
        return false;
      }

      if (existingMember) {
        console.log('Step 3 Error - User is already a team member:', existingMember);
        toast({
          variant: "destructive",
          title: "Error",
          description: "User is already a member of this team.",
        });
        return false;
      }

      // Add team member
      console.log('Step 4: Adding new team member:', { 
        team_id: teamId, 
        user_id: userData.user_id,
        role 
      });
      
      const { data: newMember, error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: teamId,
            user_id: userData.user_id,
            role: role,
          },
        ])
        .select()
        .single();

      if (memberError) {
        console.error('Step 4 Error - Failed to add team member:', memberError);
        throw memberError;
      }

      console.log('Success! Added new team member:', newMember);
      toast({
        title: "Success",
        description: "Team member added successfully.",
      });
      fetchTeams();
      return true;
    } catch (error) {
      console.error('Unexpected error in addTeamMember:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add team member. Please try again.",
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
