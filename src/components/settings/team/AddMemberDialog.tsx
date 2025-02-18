
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember } from "@/types/types";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (value: string) => void;
  role: TeamMember["role"];
  onRoleChange: (value: TeamMember["role"]) => void;
  onAddMember: () => void;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  role,
  onRoleChange,
  onAddMember,
}: AddMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">Add Team Member</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new member to your team by email address.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="member-email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Enter member's email"
              className="border-input bg-background"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="member-role" className="text-sm font-medium text-foreground">
              Role
            </label>
            <Select value={role} onValueChange={onRoleChange}>
              <SelectTrigger className="border-input bg-background">
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-input hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={onAddMember}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
