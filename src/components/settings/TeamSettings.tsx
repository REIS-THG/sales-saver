
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  UserPlus, 
  Users, 
  Mail, 
  Shield, 
  Check, 
  X, 
  Clock, 
  Trash2,
  UserX, 
  Download,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";
import { TeamInvitation, TeamMember } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { updateTeamMemberRole, cancelTeamInvitation } from "@/services/team-service";
import { TeamReportsAccess } from "@/components/team/TeamReportsAccess";
import { TeamActivityLog } from "@/components/team/TeamActivityLog";

export function TeamSettings() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, memberId: string | null }>({
    open: false,
    memberId: null
  });
  const [confirmCancelInvite, setConfirmCancelInvite] = useState<{ open: boolean, invitationId: string | null }>({
    open: false,
    invitationId: null
  });
  const [editingRole, setEditingRole] = useState<{ memberId: string, currentRole: string } | null>(null);
  
  const { 
    currentTeam, 
    teams, 
    fetchTeams, 
    inviteTeamMember, 
    removeTeamMember, 
    fetchTeamMembers,
    getUserTeamRole
  } = useTeam();
  
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (currentTeam) {
      fetchTeamData();
      getUserRole();
    } else {
      setIsLoading(false);
    }
  }, [currentTeam]);

  const getUserRole = async () => {
    if (!currentTeam) return;
    const role = await getUserTeamRole(currentTeam.id);
    setUserRole(role);
  };

  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      if (!currentTeam) return;
      
      // Fetch team members
      const members = await fetchTeamMembers(currentTeam.id);
      setMembers(members);
      
      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', currentTeam.id)
        .eq('status', 'pending');
        
      if (invitationsError) throw invitationsError;
      setInvitations(invitationsData as TeamInvitation[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch team data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentTeam) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    const success = await inviteTeamMember(
      currentTeam.id, 
      inviteEmail, 
      inviteRole
    );
    
    if (success) {
      setInviteEmail("");
      fetchTeamData();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentTeam) return;
    
    const success = await removeTeamMember(currentTeam.id, memberId);
    if (success) {
      setConfirmDelete({ open: false, memberId: null });
      fetchTeamData();
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateTeamMemberRole(memberId, newRole);
      setEditingRole(null);
      fetchTeamData();
      toast({
        title: "Role updated",
        description: "Team member role has been updated successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelTeamInvitation(invitationId);
      setConfirmCancelInvite({ open: false, invitationId: null });
      fetchTeamData();
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive"
      });
    }
  };

  const handleExportTeamReport = async () => {
    if (!currentTeam) return;
    
    try {
      // Prepare team data for export
      const teamData = {
        name: currentTeam.name,
        created_at: currentTeam.created_at,
        members: members.map(m => ({
          name: m.user?.full_name || 'Unknown',
          email: m.user?.email || 'No email',
          role: m.role,
          status: m.status,
          joined_at: m.created_at
        })),
        invitations: invitations.map(i => ({
          email: i.email,
          role: i.role,
          status: i.status,
          sent_at: i.created_at,
          expires_at: i.expires_at
        }))
      };
      
      // Convert to CSV string (simple implementation)
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Team Report: " + currentTeam.name + "\n\n"
        + "Members:\n"
        + "Name,Email,Role,Status,Joined\n"
        + members.map(m => 
            `"${m.user?.full_name || 'Unknown'}","${m.user?.email || 'No email'}","${m.role}","${m.status}","${new Date(m.created_at || '').toLocaleDateString()}"`
          ).join("\n")
        + "\n\nPending Invitations:\n"
        + "Email,Role,Expires\n"
        + invitations.map(i => 
            `"${i.email}","${i.role}","${new Date(i.expires_at || '').toLocaleDateString()}"`
          ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `team-report-${currentTeam.name}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report exported",
        description: "Team report has been exported successfully",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export team report",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

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

  const canManageTeam = userRole === 'owner' || userRole === 'admin';

  if (!teams || teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Create a team to collaborate with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Users className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <h3 className="text-lg font-medium">No Teams Yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Create a team to start collaborating with your colleagues.
              </p>
            </div>
            <Button onClick={() => fetchTeams()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Select a team to manage members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Users className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <h3 className="text-lg font-medium">No Team Selected</h3>
              <p className="text-sm text-gray-500 mt-1">
                Select a team from the dropdown in the navigation bar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Manage your team members and invitations
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {canManageTeam && (
              <Button variant="outline" size="sm" onClick={handleExportTeamReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            )}
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                {getInitials(currentTeam.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold">{currentTeam.name}</h2>
              <p className="text-sm text-gray-500">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="invitations">Invitations ({invitations.length})</TabsTrigger>
                <TabsTrigger value="reports">Reports Access</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members">
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
                </div>
              </TabsContent>
              
              <TabsContent value="invitations">
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
                </div>
              </TabsContent>
              
              <TabsContent value="reports">
                <TeamReportsAccess teamId={currentTeam.id} canManage={canManageTeam} />
              </TabsContent>
              
              <TabsContent value="activity">
                <TeamActivityLog teamId={currentTeam.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
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
    </Card>
  );
}

export default TeamSettings;
