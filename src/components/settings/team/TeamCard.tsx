
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Team, TeamMember, User } from "@/types/types";
import { UserPlus, X, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface TeamCardProps {
  team: Team;
  members: (TeamMember & { user: User })[];
  onAddMember: (teamId: string) => void;
  onRemoveMember: (teamId: string, memberId: string) => void;
  onDeleteTeam: (teamId: string) => void;
  currentUserIsOwner: boolean;
}

export function TeamCard({ team, members, onAddMember, onRemoveMember, onDeleteTeam, currentUserIsOwner }: TeamCardProps) {
  return (
    <Card key={team.id}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{team.name}</CardTitle>
          <CardDescription>
            Created {new Date(team.created_at!).toLocaleDateString()}
          </CardDescription>
        </div>
        {currentUserIsOwner && (
          <ConfirmDialog
            title="Delete Team"
            description="Are you sure you want to delete this team? This action cannot be undone."
            onConfirm={() => onDeleteTeam(team.id)}
            triggerButton={
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Team Members</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddMember(team.id)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
        <div className="space-y-2">
          {members?.map((member) => (
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
              {member.role !== "owner" && currentUserIsOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveMember(team.id, member.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
