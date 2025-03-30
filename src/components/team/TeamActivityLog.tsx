
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Activity,
  User,
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  LoaderCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamActivityLogProps {
  teamId: string;
}

interface ActivityItem {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  created_at: string;
  details?: any;
}

export function TeamActivityLog({ teamId }: TeamActivityLogProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, [teamId, activeTab, page]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('team_activity_log')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1);
      
      if (activeTab !== 'all') {
        query = query.eq('entity_type', activeTab);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      // If it's the first page, replace activities, otherwise append
      if (page === 1) {
        setActivities(data as ActivityItem[]);
      } else {
        setActivities(prev => [...prev, ...(data as ActivityItem[])]);
      }
    } catch (error) {
      console.error('Error fetching team activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch team activity log',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'deal':
        return <DollarSign className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'note':
        return <MessageSquare className="h-4 w-4" />;
      case 'team':
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'added':
        return 'bg-green-100 text-green-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatActivityMessage = (activity: ActivityItem) => {
    const { action, entity_type, entity_name, user_name } = activity;
    
    switch (entity_type) {
      case 'user':
        return `${user_name} ${action} user`;
      case 'deal':
        return `${user_name} ${action} deal "${entity_name || 'Unnamed'}"`;
      case 'report':
        return `${user_name} ${action} report "${entity_name || 'Unnamed'}"`;
      case 'note':
        return `${user_name} ${action} a note to deal`;
      case 'team':
        if (action === 'added' || action === 'removed') {
          const targetName = activity.details?.target_name || 'someone';
          return `${user_name} ${action} ${targetName} ${action === 'added' ? 'to' : 'from'} the team`;
        }
        return `${user_name} ${action} team "${entity_name || 'Unnamed'}"`;
      default:
        return `${user_name} ${action} ${entity_type}`;
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-8">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="deal">Deals</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
          <TabsTrigger value="user">Users</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <Activity className="h-12 w-12 text-gray-400" />
            <div className="text-center">
              <h3 className="text-lg font-medium">No Activity Found</h3>
              <p className="text-sm text-gray-500 mt-1">
                There is no recorded activity for this team yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                  {getActivityIcon(activity.entity_type)}
                </div>
                <div>
                  <div className="font-medium">{formatActivityMessage(activity)}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {formatTimestamp(activity.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getActionColor(activity.action)}>
                  {activity.action}
                </Badge>
                <Badge variant="outline">
                  {activity.entity_type}
                </Badge>
              </div>
            </div>
          ))}
          
          {loading && page > 1 && (
            <div className="flex justify-center py-4">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          )}
          
          {hasMore && !loading && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
