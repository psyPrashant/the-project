export interface EmployeeSkillResponse {
  id: number;
  skillId: number;
  skillName: string;
  years: number;
  projectCount: number;
}

export interface SkillSummaryResponse {
  id: number;
  name: string;
  employeeCount: number;
}

export interface SkillSearchResultResponse {
  employeeId: number;
  employeeName: string;
  skillName: string;
  years: number;
  projectCount: number;
}

export interface AddEmployeeSkillRequest {
  skillName: string;
  years: number;
}

export interface EmployeeWithSkillsResponse {
  employeeId: number;
  employeeName: string;
  skills: EmployeeSkillResponse[];
}
