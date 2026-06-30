import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateStandaloneTaskRequest,
  CreateTaskFromInteractionRequest,
  Task,
  UpdateTaskRequest,
  UpdateTaskStatusRequest
} from './task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  createFromInteraction(request: CreateTaskFromInteractionRequest): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/from-interaction`, request);
  }

  createStandalone(request: CreateStandaloneTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, request);
  }

  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/mine`);
  }

  getByEmployee(employeeId: number): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl, { params: { relatesToId: employeeId } });
  }

  updateStatus(id: number, request: UpdateTaskStatusRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/status`, request);
  }

  update(id: number, request: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
