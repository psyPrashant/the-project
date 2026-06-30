import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AddEmployeeSkillRequest,
  EmployeeSkillResponse,
  SkillSearchResultResponse,
  SkillSummaryResponse
} from './skills.models';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private readonly http = inject(HttpClient);

  getEmployeeSkills(employeeId: number): Observable<EmployeeSkillResponse[]> {
    return this.http.get<EmployeeSkillResponse[]>(
      `${environment.apiUrl}/employees/${employeeId}/skills`
    );
  }

  addSkill(employeeId: number, request: AddEmployeeSkillRequest): Observable<EmployeeSkillResponse> {
    return this.http.post<EmployeeSkillResponse>(
      `${environment.apiUrl}/employees/${employeeId}/skills`,
      request
    );
  }

  deleteSkill(employeeId: number, skillId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/employees/${employeeId}/skills/${skillId}`
    );
  }

  browseRegister(): Observable<SkillSummaryResponse[]> {
    return this.http.get<SkillSummaryResponse[]>(`${environment.apiUrl}/skills`);
  }

  searchBySkill(name: string): Observable<SkillSearchResultResponse[]> {
    return this.http.get<SkillSearchResultResponse[]>(
      `${environment.apiUrl}/skills/search`,
      { params: { skill: name } }
    );
  }
}
