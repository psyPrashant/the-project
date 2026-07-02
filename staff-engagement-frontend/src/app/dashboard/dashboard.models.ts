export interface WorkforcePulse {
  totalEmployees: number;
  employeesWithSkills: number;
  openTasks: number;
  interactionsThisWeek: number;
}

export interface ActionNeededItem {
  employeeId: number;
  employeeName: string;
  reason: string;
}

export type ActivityType = 'people' | 'skills' | 'interactions' | 'tasks' | 'portfolio';

export interface ActivityItem {
  type: ActivityType;
  actorName: string;
  targetEmployeeId: number;
  targetEmployeeName: string;
  description: string;
  occurredAt: string;
}

export interface SkillCoverageItem {
  skillId: number;
  skillName: string;
  employeeCount: number;
}

export interface SkillCoverage {
  topSkills: SkillCoverageItem[];
  orphanedSkills: SkillCoverageItem[];
}

export interface MeSummary {
  employeeId: number;
  employeeName: string;
  skillCount: number;
  openTaskCount: number;
  recentInteractionCount: number;
}

export interface DashboardResponse {
  workforcePulse: WorkforcePulse;
  actionNeeded: ActionNeededItem[];
  recentActivity: ActivityItem[];
  skillCoverage: SkillCoverage;
  me: MeSummary;
}
