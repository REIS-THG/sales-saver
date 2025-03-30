
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Team } from "@/types/team-types";

interface TeamSettingsHeaderProps {
  currentTeam: Team | null;
  handleExportTeamReport: () => Promise<void>;
  canManageTeam: boolean;
}

export function TeamSettingsHeader({ 
  currentTeam,
  handleExportTeamReport,
  canManageTeam
}: TeamSettingsHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!currentTeam) return null;

  return (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-xl font-semibold">Team Management</h3>
        <p className="text-sm text-gray-500">
          Manage your team members and invitations
        </p>
      </div>
      <div className="flex gap-2">
        {canManageTeam && (
          <button 
            onClick={handleExportTeamReport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-indigo-100 text-indigo-700">
            {getInitials(currentTeam.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
