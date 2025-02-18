
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
    <Card className="border border-input bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold text-card-foreground">
            {team.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Created {new Date(team.created_at!).toLocaleDateString()}
          </CardDescription>
        </div>
        {currentUserIsOwner && (
          <ConfirmDialog
            title="Delete Team"
            description="Are you sure you want to delete this team? This action cannot be undone."
            onConfirm={() => onDeleteTeam(team.id)}
            triggerButton={
              <Button variant="ghost" size="icon" className="hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-card-foreground">Team Members</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddMember(team.id)}
            className="border-input hover:bg-accent"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
        <div className="space-y-2">
          {members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-input"
            >
              <div>
                <p className="font-medium text-card-foreground">{member.user.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.user.email} • {member.role}
                </p>
              </div>
              {member.role !== "owner" && currentUserIsOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveMember(team.id, member.id)}
                  className="hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
