
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeam } from '@/contexts/TeamContext';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';

interface TeamCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamCreateDialog({ open, onOpenChange }: TeamCreateDialogProps) {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTeam } = useTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newTeam = await createTeam(teamName);
      if (newTeam) {
        setTeamName('');
        setTeamDescription('');
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate with your colleagues.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team-name" className="text-right">
                Team Name
              </Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="col-span-3"
                autoFocus
                placeholder="e.g. Sales Team"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="team-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="team-description"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                className="col-span-3"
                placeholder="What is this team for?"
                rows={3}
              />
            </div>
            
            <div className="col-span-4 mt-2">
              <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
                <InfoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700">
                    Team members can:
                  </p>
                  <ul className="text-sm text-blue-600 list-disc ml-4 mt-1">
                    <li>Access shared deals</li>
                    <li>View team reports</li>
                    <li>Collaborate on deal analysis</li>
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">Owner</Badge>
                    <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">Admin</Badge>
                    <Badge variant="outline" className="bg-blue-100 border-blue-200 text-blue-700">Member</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!teamName.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
