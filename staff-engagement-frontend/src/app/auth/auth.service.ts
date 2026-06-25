import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthResponse, EmployeeResponse, LoginRequest } from './auth.models';

const TOKEN_KEY = 'se_token';

/**
 * Authentication state for the SPA (F6). The token is the source of truth and is held in a
 * signal that is kept in sync with localStorage, so derived state (`isAuthenticated`) is
 * reactive and never goes stale after login/logout. The current user is held in a separate
 * signal, resolved from /auth/me during app initialization. `providedIn: 'root'` singleton.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly currentUserSignal = signal<EmployeeResponse | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUserSignal.set({
          id: response.employeeId,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName
        });
      })
    );
  }

  loadCurrentUser(): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => this.currentUserSignal.set(user))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }
}