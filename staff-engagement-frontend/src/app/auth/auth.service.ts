import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthResponse, EmployeeResponse, LoginRequest } from './auth.models';

const TOKEN_KEY = 'se_token';

/**
 * Authentication state for the SPA (F6). Token persists in localStorage; the current user is
 * held in a signal. `providedIn: 'root'` singleton.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly currentUserSignal = signal<EmployeeResponse | null>(this.restoreUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.getToken() !== null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(TOKEN_KEY, response.token);
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
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private restoreUser(): EmployeeResponse | null {
    // The real user is resolved from /auth/me by loadCurrentUser() during app initialization
    // (see app.config.ts). Until then the signal is null (still loading / anonymous) — never a
    // fabricated placeholder, which downstream code could mistake for a real employee (id 0).
    return null;
  }
}