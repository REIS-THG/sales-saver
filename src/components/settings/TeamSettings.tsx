
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/contexts/TeamContext";
import { supabase } from "@/integrations/supabase/client";
import { cancelTeamInvitation, updateTeamMemberRole } from "@/services/team";
import { TeamReportsAccess } from "@/components/team/TeamReportsAccess";

// Import refactored components
import { TeamSettingsHeader } from "./team/TeamSettingsHeader";
import { MembersTab } from "./team/MembersTab";
import { InvitationsTab } from "./team/InvitationsTab";
import { TeamActivityLog } from "@/components/team/TeamActivityLog";
import { NoTeamState } from "./team/NoTeamState";

export function TeamSettings() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members");
  
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
  const [userRole, setUserRole] = useState(null);

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
      setInvitations(invitationsData);
    } catch (error) {
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

  const handleRemoveMember = async (memberId) => {
    if (!currentTeam) return;
    
    const success = await removeTeamMember(currentTeam.id, memberId);
    if (success) {
      fetchTeamData();
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateTeamMemberRole(memberId, newRole);
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

  const handleCancelInvitation = async (invitationId) => {
    try {
      await cancelTeamInvitation(invitationId);
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

  const canManageTeam = userRole === 'owner' || userRole === 'admin';

  if (!teams || teams.length === 0) {
    return <NoTeamState type="no-teams" onCreateTeam={fetchTeams} />;
  }

  if (!currentTeam) {
    return <NoTeamState type="no-selection" />;
  }

  return (
    <Card>
      <CardHeader>
        <TeamSettingsHeader 
          currentTeam={currentTeam} 
          handleExportTeamReport={handleExportTeamReport}
          canManageTeam={canManageTeam}
        />
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
                <MembersTab 
                  members={members}
                  inviteEmail={inviteEmail}
                  setInviteEmail={setInviteEmail}
                  inviteRole={inviteRole}
                  setInviteRole={setInviteRole}
                  handleInviteMember={handleInviteMember}
                  handleRemoveMember={handleRemoveMember}
                  handleRoleChange={handleRoleChange}
                  canManageTeam={canManageTeam}
                  userRole={userRole}
                />
              </TabsContent>
              
              <TabsContent value="invitations">
                <InvitationsTab
                  invitations={invitations} 
                  canManageTeam={canManageTeam}
                  handleCancelInvitation={handleCancelInvitation}
                />
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
    </Card>
  );
}

export default TeamSettings;
