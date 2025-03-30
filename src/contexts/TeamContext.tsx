import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Team, TeamMember, User } from '@/types/types';

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: Error | null;
  setCurrentTeam: (team: Team | null) => void;
  fetchTeams: () => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<TeamMember[]>;
  createTeam: (name: string) => Promise<Team | null>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<boolean>;
  deleteTeam: (teamId: string) => Promise<boolean>;
  inviteTeamMember: (teamId: string, email: string, role: TeamMember['role']) => Promise<boolean>;
  removeTeamMember: (teamId: string, memberId: string) => Promise<boolean>;
  acceptInvitation: (teamId: string, email: string) => Promise<boolean>;
  getUserTeamRole: (teamId: string) => Promise<string | null>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTeams = useCallback(async () => {
    if (!user) {
      setTeams([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: ownedTeams, error: ownedError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user.user_id);
        
      if (ownedError) throw ownedError;
      
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select('teams(*)')
        .eq('user_id', user.user_id)
        .eq('status', 'active');
        
      if (memberError) throw memberError;
      
      const memberTeamsData = memberTeams
        .filter(item => item.teams)
        .map(item => item.teams);
      
      const allTeams = [...ownedTeams, ...memberTeamsData];
      
      const uniqueTeams = Array.from(
        new Map(allTeams.map(team => [team.id, team])).values()
      );
      
      setTeams(uniqueTeams as Team[]);
      
      if (!currentTeam && uniqueTeams.length > 0) {
        const savedTeamId = localStorage.getItem('currentTeamId');
        const savedTeam = savedTeamId 
          ? uniqueTeams.find(t => t.id === savedTeamId) 
          : uniqueTeams[0];
          
        if (savedTeam) {
          setCurrentTeam(savedTeam as Team);
        }
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: 'Failed to fetch teams',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentTeam, toast]);
  
  const fetchTeamMembers = useCallback(async (teamId: string): Promise<TeamMember[]> => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('team_id', teamId);
        
      if (error) throw error;
      
      const formattedMembers = data.map(member => ({
        id: member.id,
        team_id: member.team_id,
        user_id: member.user_id,
        role: member.role,
        status: member.status,
        created_at: member.created_at,
        updated_at: member.updated_at,
        user: member.user as User
      }));
      
      setTeamMembers(formattedMembers);
      return formattedMembers;
    } catch (err) {
      console.error('Error fetching team members:', err);
      toast({
        title: 'Failed to fetch team members',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return [];
    }
  }, [toast]);
  
  const createTeam = useCallback(async (name: string): Promise<Team | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name, owner_id: user.user_id }])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Team created',
        description: `"${name}" has been created successfully.`,
        variant: 'default'
      });
      
      await fetchTeams();
      return data as Team;
    } catch (err) {
      console.error('Error creating team:', err);
      toast({
        title: 'Failed to create team',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return null;
    }
  }, [user, fetchTeams, toast]);
  
  const updateTeam = useCallback(async (teamId: string, updates: Partial<Team>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId);
        
      if (error) throw error;
      
      toast({
        title: 'Team updated',
        description: `Team has been updated successfully.`,
        variant: 'default'
      });
      
      await fetchTeams();
      return true;
    } catch (err) {
      console.error('Error updating team:', err);
      toast({
        title: 'Failed to update team',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchTeams, toast]);
  
  const deleteTeam = useCallback(async (teamId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
        
      if (error) throw error;
      
      toast({
        title: 'Team deleted',
        description: `Team has been deleted successfully.`,
        variant: 'default'
      });
      
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null);
        localStorage.removeItem('currentTeamId');
      }
      
      await fetchTeams();
      return true;
    } catch (err) {
      console.error('Error deleting team:', err);
      toast({
        title: 'Failed to delete team',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return false;
    }
  }, [currentTeam, fetchTeams, toast]);
  
  const inviteTeamMember = useCallback(async (
    teamId: string, 
    email: string, 
    role: TeamMember['role']
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('team_invitations')
        .insert([{ 
          team_id: teamId, 
          email: email.toLowerCase().trim(),
          role, 
          invited_by: user.user_id 
        }]);
        
      if (error) throw error;
      
      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${email}.`,
        variant: 'default'
      });
      
      return true;
    } catch (err) {
      console.error('Error inviting team member:', err);
      toast({
        title: 'Failed to send invitation',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return false;
    }
  }, [user, toast]);
  
  const removeTeamMember = useCallback(async (teamId: string, memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('team_id', teamId);
        
      if (error) throw error;
      
      toast({
        title: 'Member removed',
        description: `Team member has been removed successfully.`,
        variant: 'default'
      });
      
      await fetchTeamMembers(teamId);
      return true;
    } catch (err) {
      console.error('Error removing team member:', err);
      toast({
        title: 'Failed to remove team member',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchTeamMembers, toast]);
  
  const acceptInvitation = useCallback(async (teamId: string, email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('accept-team-invitation', {
        body: { 
          email: email,
          teamId: teamId 
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        toast({
          title: 'Invitation accepted',
          description: `You have joined the team successfully.`,
          variant: 'default'
        });
        
        await fetchTeams();
        return true;
      } else {
        toast({
          title: 'Invalid invitation',
          description: 'The invitation may have expired or been revoked.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast({
        title: 'Failed to accept invitation',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchTeams, toast]);
  
  const getUserTeamRole = useCallback(async (teamId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-user-team-role', {
        body: { teamId }
      });
      
      if (error) throw error;
      return data?.role || null;
    } catch (err) {
      console.error('Error getting user team role:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);
  
  useEffect(() => {
    if (currentTeam) {
      localStorage.setItem('currentTeamId', currentTeam.id);
    }
  }, [currentTeam]);

  const value = {
    currentTeam,
    teams,
    teamMembers,
    isLoading,
    error,
    setCurrentTeam,
    fetchTeams,
    fetchTeamMembers,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteTeamMember,
    removeTeamMember,
    acceptInvitation,
    getUserTeamRole
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeam = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
