
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Team } from "@/types/types";
import { useTeamMembers } from "@/hooks/use-team-members";
import { 
  fetchUserTeams, 
  fetchTeamMembers, 
  createTeam as createTeamService,
  deleteTeam as deleteTeamService
} from "@/services/team-service";
import { supabase } from "@/integrations/supabase/client";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { 
    teamMembers, 
    setTeamMembers, 
    addTeamMember: addMember, 
    removeTeamMember: removeMember 
  } = useTeamMembers();

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("No authenticated user");
      }

      const teams = await fetchUserTeams();
      setTeams(teams);

      // Fetch members for each team
      const membersPromises = teams.map(async (team) => {
        const members = await fetchTeamMembers(team.id);
        return { teamId: team.id, members };
      });

      const membersResults = await Promise.all(membersPromises);
      const membersMap: Record<string, typeof membersResults[0]["members"]> = {};
      membersResults.forEach(({ teamId, members }) => {
        membersMap[teamId] = members;
      });

      setTeamMembers(membersMap);
    } catch (error) {
      console.error("Error in fetchTeams:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, setTeamMembers]);

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

      await createTeamService(teamName, userData.user.id);
      
      toast({
        title: "Success",
        description: "Team created successfully.",
      });
      await fetchTeams();
      return true;
    } catch (error) {
      console.error("Error in createTeam:", error);
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
      await deleteTeamService(teamId);
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });
      await fetchTeams();
      return true;
    } catch (error) {
      console.error("Error in deleteTeam:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete team. Please try again.",
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
    addTeamMember: addMember,
    removeTeamMember: removeMember,
  };
}
