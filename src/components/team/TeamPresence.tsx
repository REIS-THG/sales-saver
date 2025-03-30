
import { useEffect, useState } from 'react';
import { useTeam } from '@/contexts/TeamContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TeamPresenceData } from '@/types/team-types';

type PresenceState = {
  [key: string]: TeamPresenceData[];
};

export function TeamPresence() {
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [presenceChannel, setPresenceChannel] = useState<any>(null);

  useEffect(() => {
    if (!currentTeam || !user) return;

    const channelName = `team_presence:${currentTeam.id}`;
    
    // Create a new channel with the team ID
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.user_id,
        },
      },
    });

    // Set up presence handlers
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresenceState(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      });

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track presence once subscribed
        const pathname = window.location.pathname;
        await channel.track({
          user_id: user.user_id,
          full_name: user.full_name || 'Unknown User',
          avatar_url: user.avatar_url || null,
          last_seen: new Date().toISOString(),
          page: pathname,
        });
      }
    });

    setPresenceChannel(channel);

    // Cleanup function
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [currentTeam, user]);

  // Update presence on route change
  useEffect(() => {
    const updatePresence = async () => {
      if (presenceChannel && user) {
        const pathname = window.location.pathname;
        await presenceChannel.track({
          user_id: user.user_id,
          full_name: user.full_name || 'Unknown User',
          avatar_url: user.avatar_url || null,
          last_seen: new Date().toISOString(),
          page: pathname,
        });
      }
    };

    updatePresence();
  }, [window.location.pathname, presenceChannel, user]);

  if (!currentTeam || Object.keys(presenceState).length === 0) {
    return null;
  }

  // Flatten presences and remove duplicates by user_id
  const presentUsers = Object.values(presenceState).flat();
  const uniqueUsers = presentUsers.filter((user, index, self) =>
    index === self.findIndex(u => u.user_id === user.user_id)
  );

  return (
    <div className="flex -space-x-2 overflow-hidden">
      <TooltipProvider>
        {uniqueUsers.map((presence) => (
          <Tooltip key={presence.user_id}>
            <TooltipTrigger asChild>
              <Avatar className="h-8 w-8 border-2 border-background">
                {presence.avatar_url ? (
                  <AvatarImage src={presence.avatar_url} alt={presence.full_name} />
                ) : (
                  <AvatarFallback className="bg-indigo-500 text-white text-xs">
                    {presence.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{presence.full_name}</p>
              <p className="text-xs text-muted-foreground">
                On: {presence.page.replace('/', '').replace('-', ' ') || 'Home'}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
