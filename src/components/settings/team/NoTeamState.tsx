
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NoTeamStateProps {
  type: "no-teams" | "no-selection";
  onCreateTeam?: () => void;
}

export function NoTeamState({ type, onCreateTeam }: NoTeamStateProps) {
  if (type === "no-teams") {
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
            <Button onClick={onCreateTeam}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
