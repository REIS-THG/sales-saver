import { useEffect, useState } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamPresenceProps {
  dealId?: string;
  reportId?: string;
  analysisId?: string;
}

interface UserPresence {
  userId: string;
  fullName: string;
  email: string;
  viewing: {
    dealId?: string;
    reportId?: string;
    analysisId?: string;
  };
  lastActive: string;
}

export function TeamPresence({ dealId, reportId, analysisId }: TeamPresenceProps) {
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  
  useEffect(() => {
    if (!currentTeam || !user) return;
    
    // Set up realtime presence
    const presenceChannel = supabase.channel(`team-presence-${currentTeam.id}`);
    
    const userStatus = {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email || '',
      viewing: {
        dealId,
        reportId,
        analysisId
      },
      lastActive: new Date().toISOString()
    };
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(presenceState).forEach(key => {
          const userPresences = presenceState[key] as UserPresence[];
          if (userPresences && userPresences.length > 0) {
            users.push(userPresences[0]);
          }
        });
        
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track(userStatus);
        }
      });
    
    // Update presence every 30 seconds to keep connection alive
    const interval = setInterval(async () => {
      await presenceChannel.track({
        ...userStatus,
        lastActive: new Date().toISOString()
      });
    }, 30000);
    
    return () => {
      supabase.removeChannel(presenceChannel);
      clearInterval(interval);
    };
  }, [currentTeam, user, dealId, reportId, analysisId]);
  
  // Filter only users viewing the current resource
  const usersViewingCurrent = activeUsers.filter(u => {
    if (dealId && u.viewing.dealId === dealId) return true;
    if (reportId && u.viewing.reportId === reportId) return true;
    if (analysisId && u.viewing.analysisId === analysisId) return true;
    return false;
  });
  
  // Don't include the current user
  const otherUsersViewingCurrent = usersViewingCurrent.filter(
    u => u.userId !== user?.user_id
  );
  
  if (!currentTeam || otherUsersViewingCurrent.length === 0) {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex items-center space-x-1">
      {otherUsersViewingCurrent.length > 0 && (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-800 px-2 py-0 h-6 flex items-center">
          <Eye className="h-3 w-3 mr-1" />
          <span className="text-xs">{otherUsersViewingCurrent.length}</span>
        </Badge>
      )}
      
      <div className="flex -space-x-2">
        <TooltipProvider>
          {otherUsersViewingCurrent.slice(0, 3).map((userPresence, index) => (
            <Tooltip key={userPresence.userId}>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-800">
                    {getInitials(userPresence.fullName)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-sm">{userPresence.fullName} is viewing this</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {otherUsersViewingCurrent.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="text-xs">
                    +{otherUsersViewingCurrent.length - 3}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-sm">{otherUsersViewingCurrent.length - 3} more team members viewing</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
