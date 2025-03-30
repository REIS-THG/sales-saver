
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
  UserX 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";
import { TeamInvitation, TeamMember } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  useEffect(() => {
    if (currentTeam) {
      fetchTeamData();
    } else {
      setIsLoading(false);
    }
  }, [currentTeam]);

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
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-indigo-100 text-indigo-700">
              {getInitials(currentTeam.name)}
            </AvatarFallback>
          </Avatar>
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
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role === 'owner' && <Shield className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                        <Badge className={getStatusBadgeColor(member.status)}>
                          {member.status === 'active' && <Check className="h-3 w-3 mr-1" />}
                          {member.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {member.status === 'inactive' && <X className="h-3 w-3 mr-1" />}
                          {member.status}
                        </Badge>
                        
                        {/* Don't show remove button for team owner */}
                        {member.role !== 'owner' && (
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
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
    </Card>
  );
}

export default TeamSettings;
