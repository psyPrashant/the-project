export interface EducationResponse {
  id: number;
  employeeId: number;
  institution: string;
  qualification: string;
  fieldOfStudy: string | null;
  startYear: number | null;
  endYear: number | null;
  description: string | null;
}

export interface CreateEducationRequest {
  institution: string;
  qualification: string;
  fieldOfStudy?: string;
  startYear?: number | null;
  endYear?: number | null;
  description?: string;
}

export interface UpdateEducationRequest {
  institution: string;
  qualification: string;
  fieldOfStudy?: string;
  startYear?: number | null;
  endYear?: number | null;
  description?: string;
}

export interface ProjectResponse {
  id: number;
  employeeId: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  url: string | null;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
}

export interface ShowcaseLinkResponse {
  id: number;
  employeeId: number;
  label: string;
  url: string;
  sortOrder: number | null;
}

export interface CreateShowcaseLinkRequest {
  label: string;
  url: string;
  sortOrder?: number | null;
}

export interface UpdateShowcaseLinkRequest {
  label: string;
  url: string;
  sortOrder?: number | null;
}

import { EmployeeSkillResponse } from '../skills/skills.models';

export interface PortfolioResponse {
  employeeId: number;
  education: EducationResponse[];
  projects: ProjectResponse[];
  links: ShowcaseLinkResponse[];
  skills: EmployeeSkillResponse[];
}
