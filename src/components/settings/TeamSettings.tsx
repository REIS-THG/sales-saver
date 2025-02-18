
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { CreateTeamDialog } from "./team/CreateTeamDialog";
import { AddMemberDialog } from "./team/AddMemberDialog";
import { TeamCard } from "./team/TeamCard";
import { useTeams } from "./team/useTeams";
import { TeamMember } from "@/types/types";

export function TeamSettings() {
  const { teams, teamMembers, loading, createTeam, addTeamMember, removeTeamMember, fetchTeams } = useTeams();
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState<TeamMember["role"]>("member");
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async () => {
    if (await createTeam(newTeamName)) {
      setCreateTeamOpen(false);
      setNewTeamName("");
    }
  };

  const handleAddMember = async () => {
    if (!addMemberEmail.trim() || !addMemberTeamId || !addMemberRole) return;

    if (await addTeamMember(addMemberEmail, addMemberTeamId, addMemberRole)) {
      setAddMemberDialogOpen(false);
      setAddMemberEmail("");
      setAddMemberRole("member");
      setAddMemberTeamId(null);
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
            <TeamCard
              key={team.id}
              team={team}
              members={teamMembers[team.id] || []}
              onAddMember={(teamId) => {
                setAddMemberTeamId(teamId);
                setAddMemberDialogOpen(true);
              }}
              onRemoveMember={removeTeamMember}
            />
          ))}
        </div>
      )}

      <CreateTeamDialog
        open={createTeamOpen}
        onOpenChange={setCreateTeamOpen}
        newTeamName={newTeamName}
        onNewTeamNameChange={setNewTeamName}
        onCreateTeam={handleCreateTeam}
      />

      <AddMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        email={addMemberEmail}
        onEmailChange={setAddMemberEmail}
        role={addMemberRole}
        onRoleChange={setAddMemberRole}
        onAddMember={handleAddMember}
      />
    </div>
  );
}
