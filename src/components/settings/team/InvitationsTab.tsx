
import { useState } from "react";
import { Mail, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamInvitation } from "@/types/team-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InvitationsTabProps {
  invitations: TeamInvitation[];
  canManageTeam: boolean;
  handleCancelInvitation: (invitationId: string) => Promise<void>;
}

export function InvitationsTab({
  invitations,
  canManageTeam,
  handleCancelInvitation
}: InvitationsTabProps) {
  const [confirmCancelInvite, setConfirmCancelInvite] = useState<{ open: boolean, invitationId: string | null }>({
    open: false,
    invitationId: null
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {invitations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-2" />
          <p>No pending invitations</p>
        </div>
      ) : (
        invitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">{invitation.email}</div>
                <div className="text-xs text-gray-500">
                  Invited: {formatDate(invitation.created_at)} • 
                  Expires: {formatDate(invitation.expires_at)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getRoleBadgeColor(invitation.role)}>
                {invitation.role}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
              {canManageTeam && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                  onClick={() => setConfirmCancelInvite({
                    open: true,
                    invitationId: invitation.id
                  })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))
      )}

      <AlertDialog 
        open={confirmCancelInvite.open} 
        onOpenChange={(open) => setConfirmCancelInvite({ ...confirmCancelInvite, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation?
              The invitee will no longer be able to join the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => confirmCancelInvite.invitationId && handleCancelInvitation(confirmCancelInvite.invitationId)}
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
