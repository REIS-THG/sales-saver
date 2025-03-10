
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserPlus, Users, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
}

export function TeamSettings() {
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTeamInfo();
    }
  }, [user]);

  const fetchTeamInfo = async () => {
    setIsLoading(true);
    try {
      // First, get the team info for the current user
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (teamError && teamError.code !== 'PGRST116') { // Not found is ok
        throw teamError;
      }

      if (teamData) {
        setTeamName(teamData.name);
        
        // Then fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select(`
            id,
            user_profiles (id, full_name, email),
            role,
            status
          `)
          .eq('team_id', teamData.id);

        if (membersError) throw membersError;

        const formattedMembers = membersData.map((member: any) => ({
          id: member.id,
          email: member.user_profiles.email,
          full_name: member.user_profiles.full_name,
          role: member.role,
          status: member.status
        }));

        setMembers(formattedMembers);
      } else {
        // No team exists yet, set current user as the only member
        setMembers([
          {
            id: user?.id || '',
            email: user?.email || '',
            full_name: user?.full_name || '',
            role: 'owner',
            status: 'active'
          }
        ]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to fetch team info: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([
          { name: teamName, owner_id: user?.id }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      // Refresh team data
      fetchTeamInfo();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create team: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    // This would typically involve an API call to send an invitation email
    // For now, we'll simulate it
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${inviteEmail}`,
    });
    setInviteEmail("");
  };

  const renderTeamForm = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="team-name">Team Name</Label>
        <Input
          id="team-name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter team name"
        />
      </div>
      <Button onClick={handleCreateTeam}>
        <Users className="mr-2 h-4 w-4" />
        Create Team
      </Button>
    </div>
  );

  const renderTeamMembers = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Team Members</h3>
      
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                {member.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{member.full_name}</div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs px-2 py-1 rounded-full bg-gray-100">
                {member.role}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                member.status === 'active' ? 'bg-green-100 text-green-800' : 
                member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-gray-100'
              }`}>
                {member.status}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-medium mb-2">Invite New Member</h3>
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              type="email"
            />
          </div>
          <Button onClick={handleInviteMember}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>
          Manage your team members and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : teamName ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">{teamName}</h2>
                <p className="text-sm text-gray-500">{members.length} members</p>
              </div>
            </div>
            {renderTeamMembers()}
          </>
        ) : (
          renderTeamForm()
        )}
      </CardContent>
    </Card>
  );
}

export default TeamSettings;
