
import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Users, Plus, Settings, ChevronDown } from 'lucide-react';
import { useTeam } from '@/contexts/TeamContext';
import { Team } from '@/types/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { TeamCreateDialog } from './TeamCreateDialog';

export function TeamSelector() {
  const { currentTeam, teams, setCurrentTeam } = useTeam();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleTeamSelect = (team: Team) => {
    setCurrentTeam(team);
  };

  const handleCreateTeam = () => {
    setIsCreateDialogOpen(true);
  };

  const handleTeamSettings = () => {
    navigate('/settings', { state: { defaultTab: 'team' } });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 h-9 px-2">
            {currentTeam ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                    {getInitials(currentTeam.name)}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <span className="font-medium text-sm truncate max-w-[100px]">
                    {currentTeam.name}
                  </span>
                )}
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                {!isMobile && <span className="text-sm">Personal</span>}
              </>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className={`${!currentTeam ? 'bg-accent text-accent-foreground' : ''}`}
            onClick={() => setCurrentTeam(null)}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Personal</span>
          </DropdownMenuItem>
          
          {teams.map(team => (
            <DropdownMenuItem
              key={team.id}
              className={`${currentTeam?.id === team.id ? 'bg-accent text-accent-foreground' : ''}`}
              onClick={() => handleTeamSelect(team)}
            >
              <Avatar className="h-5 w-5 mr-2">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                  {getInitials(team.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{team.name}</span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCreateTeam}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Team</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTeamSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Team Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <TeamCreateDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </>
  );
}
