import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Team, TeamMember, User } from "@/types/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, UserPlus, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function TeamSettings() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, (TeamMember & { user: User })[]>>({});
  const [loading, setLoading] = useState(true);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState<TeamMember["role"]>("member");
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*");

      if (teamsError) throw teamsError;

      const teams = teamsData as Team[];
      setTeams(teams);

      // Fetch members for each team
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

        return { teamId: team.id, members: membersData || [] };
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
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert([
          {
            name: newTeamName.trim(),
            owner_id: userData.user.id,
          },
        ])
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as owner member
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

      setCreateTeamOpen(false);
      setNewTeamName("");
      toast({
        title: "Success",
        description: "Team created successfully.",
      });
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create team. Please try again.",
      });
    }
  };

  const addTeamMember = async () => {
    if (!addMemberEmail.trim() || !addMemberTeamId || !addMemberRole) return;

    try {
      // First, fetch the user by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", addMemberEmail.trim())
        .maybeSingle();

      if (!userData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "User not found. Please check the email address.",
        });
        return;
      }

      // Add team member
      const { error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: addMemberTeamId,
            user_id: userData.user_id,
            role: addMemberRole,
          },
        ]);

      if (memberError) throw memberError;

      setAddMemberDialogOpen(false);
      setAddMemberEmail("");
      setAddMemberRole("member");
      setAddMemberTeamId(null);
      toast({
        title: "Success",
        description: "Team member added successfully.",
      });
      fetchTeams();
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add team member. Please try again.",
      });
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
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove team member. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Button onClick={() => setCreateTeamOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No teams yet. Create your first team to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  Created {new Date(team.created_at!).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Team Members</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAddMemberTeamId(team.id);
                      setAddMemberDialogOpen(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                <div className="space-y-2">
                  {teamMembers[team.id]?.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{member.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email} • {member.role}
                        </p>
                      </div>
                      {member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(team.id, member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="team-name" className="text-sm font-medium">
                Team Name
              </label>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTeam}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your team by email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="member-email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="member-email"
                type="email"
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                placeholder="Enter member's email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="member-role" className="text-sm font-medium">
                Role
              </label>
              <Select value={addMemberRole} onValueChange={(value: TeamMember["role"]) => setAddMemberRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addTeamMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
