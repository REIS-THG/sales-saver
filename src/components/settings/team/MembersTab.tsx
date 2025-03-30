
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, UserX, Shield, Check, Clock, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TeamMember } from "@/types/team-types";
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

interface MembersTabProps {
  members: TeamMember[];
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: "admin" | "member";
  setInviteRole: (role: "admin" | "member") => void;
  handleInviteMember: () => Promise<void>;
  handleRemoveMember: (memberId: string) => Promise<void>;
  handleRoleChange: (memberId: string, newRole: string) => Promise<void>;
  canManageTeam: boolean;
  userRole: string | null;
}

export function MembersTab({
  members,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  handleInviteMember,
  handleRemoveMember,
  handleRoleChange,
  canManageTeam,
  userRole
}: MembersTabProps) {
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, memberId: string | null }>({
    open: false,
    memberId: null
  });
  const [editingRole, setEditingRole] = useState<{ memberId: string, currentRole: string } | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gray-100">
                {getInitials(member.user?.full_name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.user?.full_name || 'Unknown User'}</div>
              <div className="text-sm text-gray-500">{member.user?.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {editingRole && editingRole.memberId === member.id ? (
              <Select 
                defaultValue={editingRole.currentRole}
                onValueChange={(value) => handleRoleChange(member.id, value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge 
                className={`${getRoleBadgeColor(member.role)} cursor-pointer`}
                onClick={() => canManageTeam && member.role !== 'owner' && setEditingRole({ 
                  memberId: member.id, 
                  currentRole: member.role 
                })}
              >
                {member.role === 'owner' && <Shield className="h-3 w-3 mr-1" />}
                {member.role}
              </Badge>
            )}
            <Badge className={getStatusBadgeColor(member.status)}>
              {member.status === 'active' && <Check className="h-3 w-3 mr-1" />}
              {member.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {member.status === 'inactive' && <X className="h-3 w-3 mr-1" />}
              {member.status}
            </Badge>
            
            {/* Only owners can remove members and admins cannot remove owners */}
            {canManageTeam && member.role !== 'owner' && userRole === 'owner' && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-red-500"
                onClick={() => setConfirmDelete({ 
                  open: true, 
                  memberId: member.id 
                })}
              >
                <UserX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
      
      {canManageTeam && (
        <div className="pt-6 border-t mt-6">
          <h3 className="text-lg font-medium mb-4">Add Team Member</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                type="email"
              />
            </div>
            <Select 
              value={inviteRole} 
              onValueChange={(value) => setInviteRole(value as "admin" | "member")}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleInviteMember}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
        </div>
      )}

      <AlertDialog 
        open={confirmDelete.open} 
        onOpenChange={(open) => setConfirmDelete({ ...confirmDelete, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the team? 
              They will lose access to all team resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => confirmDelete.memberId && handleRemoveMember(confirmDelete.memberId)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
