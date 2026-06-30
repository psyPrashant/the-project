import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateEmployeeRequest, EmployeeProfileResponse, UpdateEmployeeRequest } from './employee.models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  getAll(search?: string, includeArchived?: boolean): Observable<EmployeeProfileResponse[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (includeArchived) params = params.set('includeArchived', 'true');
    return this.http.get<EmployeeProfileResponse[]>(this.baseUrl, { params });
  }

  getProfile(id: number): Observable<EmployeeProfileResponse> {
    return this.http.get<EmployeeProfileResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateEmployeeRequest): Observable<EmployeeProfileResponse> {
    return this.http.post<EmployeeProfileResponse>(this.baseUrl, request);
  }

  update(id: number, request: UpdateEmployeeRequest): Observable<EmployeeProfileResponse> {
    return this.http.put<EmployeeProfileResponse>(`${this.baseUrl}/${id}`, request);
  }

  archive(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/archive`, null);
  }

  unarchive(id: number): Observable<EmployeeProfileResponse> {
    return this.http.patch<EmployeeProfileResponse>(`${this.baseUrl}/${id}/unarchive`, null);
  }
}
