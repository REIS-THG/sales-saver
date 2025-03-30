import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, FileText, Trash2, UserPlus, UserMinus, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamActivityLogProps {
  teamId: string;
}

type ActivityLog = {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  user_name?: string;
};

export function TeamActivityLog({ teamId }: TeamActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    
    // This is a placeholder for actual activity logging
    // In a real implementation, you would create a team_activity_log table
    // and query it here
    
    // For now, let's simulate some activities
    const simulatedActivities = [
      {
        id: '1',
        team_id: teamId,
        user_id: '1',
        action: 'member_added',
        details: { member_name: 'Jane Smith', role: 'member' },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        user_name: 'Admin User'
      },
      {
        id: '2',
        team_id: teamId,
        user_id: '2',
        action: 'deal_created',
        details: { deal_name: 'New Enterprise Deal' },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        user_name: 'John Doe'
      },
      {
        id: '3',
        team_id: teamId,
        user_id: '3',
        action: 'settings_updated',
        details: { setting: 'Team name', new_value: 'Sales Tigers' },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        user_name: 'Alex Johnson'
      }
    ];
    
    setActivities(simulatedActivities);
    setLoading(false);
  }, [teamId]);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'member_added':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'member_removed':
        return <UserMinus className="h-4 w-4 text-red-500" />;
      case 'deal_created':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'deal_updated':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'deal_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'settings_updated':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: ActivityLog) => {
    switch (activity.action) {
      case 'member_added':
        return `added ${activity.details.member_name} as ${activity.details.role}`;
      case 'member_removed':
        return `removed ${activity.details.member_name} from the team`;
      case 'deal_created':
        return `created deal "${activity.details.deal_name}"`;
      case 'deal_updated':
        return `updated deal "${activity.details.deal_name}"`;
      case 'deal_deleted':
        return `deleted deal "${activity.details.deal_name}"`;
      case 'settings_updated':
        return `updated ${activity.details.setting} to "${activity.details.new_value}"`;
      default:
        return `performed an action`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-3 p-3 border rounded">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <Clock className="h-12 w-12 text-gray-400" />
          <div className="text-center">
            <h3 className="text-lg font-medium">No Activity Yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Team activities will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50 transition-colors">
          <div className="flex-shrink-0 mt-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {getInitials(activity.user_name || 'User')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              <span className="font-medium">{activity.user_name}</span>
              <span className="mx-1.5">{getActivityIcon(activity.action)}</span>
              <span>{getActivityDescription(activity)}</span>
            </div>
            <p className="text-xs text-gray-500">
              {formatDate(activity.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
