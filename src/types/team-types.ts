
import { User } from './types';

export type TeamMemberRole = 'owner' | 'admin' | 'member';
export type TeamMemberStatus = 'active' | 'inactive' | 'pending';
export type TeamInvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  invite_code?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamMemberRole;
  invited_by: string;
  created_at: string;
  expires_at: string;
  status: TeamInvitationStatus;
}

export interface TeamReportAccess {
  id: string;
  team_id: string;
  report_id: string;
  created_at: string;
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  user_name?: string;
}

export interface TeamPresenceData {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  last_seen: string;
  page: string;
}

export { User };
