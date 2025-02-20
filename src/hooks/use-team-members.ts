
import { useState } from "react";
import { TeamMember, User } from "@/types/types";
import { useToast } from "@/hooks/use-toast";
import { addTeamMember, removeTeamMember } from "@/services/team-service";

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<Record<string, (TeamMember & { user: User })[]>>({});
  const { toast } = useToast();

  const addMember = async (email: string, teamId: string, role: TeamMember["role"]) => {
    try {
      await addTeamMember(email, teamId, role);
      toast({
        title: "Success",
        description: "Team member added successfully.",
      });
      return true;
    } catch (error: any) {
      console.error('Error in addTeamMember:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add team member. Please try again.",
      });
      return false;
    }
  };

  const removeMember = async (teamId: string, memberId: string) => {
    try {
      await removeTeamMember(memberId);
      toast({
        title: "Success",
        description: "Team member removed successfully.",
      });
      return true;
    } catch (error) {
      console.error("Error in removeTeamMember:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member. Please try again.",
      });
      return false;
    }
  };

  return {
    teamMembers,
    setTeamMembers,
    addTeamMember: addMember,
    removeTeamMember: removeMember,
  };
}
