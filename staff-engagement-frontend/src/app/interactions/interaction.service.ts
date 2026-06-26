import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateInteractionRequest, InteractionResponse, UpdateInteractionRequest } from './interaction.models';

@Injectable({ providedIn: 'root' })
export class InteractionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/interactions`;

  create(request: CreateInteractionRequest): Observable<InteractionResponse> {
    return this.http.post<InteractionResponse>(this.baseUrl, request);
  }

  findBySubject(subjectId: number): Observable<InteractionResponse[]> {
    const params = new HttpParams().set('subjectId', subjectId.toString());
    return this.http.get<InteractionResponse[]>(this.baseUrl, { params });
  }

  findById(id: number): Observable<InteractionResponse> {
    return this.http.get<InteractionResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: number, request: UpdateInteractionRequest): Observable<InteractionResponse> {
    return this.http.put<InteractionResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
