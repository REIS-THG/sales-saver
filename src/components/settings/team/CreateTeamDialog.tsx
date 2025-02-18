
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTeamName: string;
  onNewTeamNameChange: (value: string) => void;
  onCreateTeam: () => void;
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  newTeamName,
  onNewTeamNameChange,
  onCreateTeam,
}: CreateTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">Create Team</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new team to collaborate with others.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="team-name" className="text-sm font-medium text-foreground">
              Team Name
            </label>
            <Input
              id="team-name"
              value={newTeamName}
              onChange={(e) => onNewTeamNameChange(e.target.value)}
              placeholder="Enter team name"
              className="border-input bg-background"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={onCreateTeam}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
