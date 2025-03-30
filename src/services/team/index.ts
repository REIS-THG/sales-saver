
// This file re-exports all team service functions for backward compatibility
import { fetchUserTeams, createTeam, updateTeam, deleteTeam } from './team-core';
import { fetchTeamMembers, updateTeamMemberRole, removeTeamMember } from './team-members';
import { fetchTeamInvitations, inviteTeamMember, cancelTeamInvitation, acceptTeamInvitation } from './team-invitations';
import { getTeamReportAccess, updateTeamReportAccess } from './team-reports';
import { fetchTeamActivity, exportTeamReport } from './team-activity';
import { getUserTeamRole } from './team-roles';

export {
  // Core team operations
  fetchUserTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  
  // Team members
  fetchTeamMembers,
  updateTeamMemberRole,
  removeTeamMember,
  
  // Team invitations
  fetchTeamInvitations,
  inviteTeamMember,
  cancelTeamInvitation,
  acceptTeamInvitation,
  
  // Team reports
  getTeamReportAccess,
  updateTeamReportAccess,
  
  // Team activity
  fetchTeamActivity,
  exportTeamReport,
  
  // Team roles
  getUserTeamRole
};
