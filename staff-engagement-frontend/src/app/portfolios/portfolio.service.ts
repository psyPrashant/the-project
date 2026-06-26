import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateEducationRequest,
  CreateProjectRequest,
  CreateShowcaseLinkRequest,
  EducationResponse,
  PortfolioResponse,
  ProjectResponse,
  ShowcaseLinkResponse,
  UpdateEducationRequest,
  UpdateProjectRequest,
  UpdateShowcaseLinkRequest
} from './portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);

  private baseUrl(employeeId: number): string {
    return `${environment.apiUrl}/employees/${employeeId}/portfolio`;
  }

  getPortfolio(employeeId: number): Observable<PortfolioResponse> {
    return this.http.get<PortfolioResponse>(this.baseUrl(employeeId));
  }

  // Education

  addEducation(employeeId: number, request: CreateEducationRequest): Observable<EducationResponse> {
    return this.http.post<EducationResponse>(`${this.baseUrl(employeeId)}/education`, request);
  }

  updateEducation(employeeId: number, id: number, request: UpdateEducationRequest): Observable<EducationResponse> {
    return this.http.put<EducationResponse>(`${this.baseUrl(employeeId)}/education/${id}`, request);
  }

  deleteEducation(employeeId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(employeeId)}/education/${id}`);
  }

  // Projects

  addProject(employeeId: number, request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(`${this.baseUrl(employeeId)}/projects`, request);
  }

  updateProject(employeeId: number, id: number, request: UpdateProjectRequest): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.baseUrl(employeeId)}/projects/${id}`, request);
  }

  deleteProject(employeeId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(employeeId)}/projects/${id}`);
  }

  // Showcase links

  addLink(employeeId: number, request: CreateShowcaseLinkRequest): Observable<ShowcaseLinkResponse> {
    return this.http.post<ShowcaseLinkResponse>(`${this.baseUrl(employeeId)}/links`, request);
  }

  updateLink(employeeId: number, id: number, request: UpdateShowcaseLinkRequest): Observable<ShowcaseLinkResponse> {
    return this.http.put<ShowcaseLinkResponse>(`${this.baseUrl(employeeId)}/links/${id}`, request);
  }

  deleteLink(employeeId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(employeeId)}/links/${id}`);
  }
}
