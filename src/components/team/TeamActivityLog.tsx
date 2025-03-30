
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LoaderCircle, User, UserPlus, UserMinus, Settings, Mail } from "lucide-react";
import { fetchTeamActivity } from "@/services/team-service";
import { TeamActivity } from "@/types/team-types";

interface TeamActivityLogProps {
  teamId: string;
}

export function TeamActivityLog({ teamId }: TeamActivityLogProps) {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      try {
        const data = await fetchTeamActivity(teamId);
        setActivities(data);
      } catch (error) {
        console.error("Error loading team activities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [teamId]);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'member_added':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'member_removed':
        return <UserMinus className="h-4 w-4 text-red-500" />;
      case 'invitation_sent':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'settings_changed':
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <Settings className="h-12 w-12 text-gray-400" />
          <div className="text-center">
            <h3 className="text-lg font-medium">No Activity Yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Team activities will appear here when they happen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start p-3 border rounded-md">
          <div className="mr-3 mt-1">
            {getActivityIcon(activity.action)}
          </div>
          <div className="flex-1">
            <div className="font-medium">
              {activity.user_name || "Unknown user"}
            </div>
            <div className="text-sm text-gray-500">
              {activity.details.description || activity.action.replace(/_/g, ' ')}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(activity.created_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
