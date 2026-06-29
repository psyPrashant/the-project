// @ts-nocheck
export interface EmployeeProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
  department: string | null;
  phone: string | null;
  archived: boolean;
}
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
}
export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
}