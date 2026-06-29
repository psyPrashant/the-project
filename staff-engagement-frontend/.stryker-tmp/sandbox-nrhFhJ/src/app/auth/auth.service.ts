// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, EmployeeResponse, LoginRequest } from './auth.models';
const TOKEN_KEY = stryMutAct_9fa48("27") ? "" : (stryCov_9fa48("27"), 'se_token');

/**
 * Authentication state for the SPA (F6). The token is the source of truth and is held in a
 * signal that is kept in sync with localStorage, so derived state (`isAuthenticated`) is
 * reactive and never goes stale after login/logout. The current user is held in a separate
 * signal, resolved from /auth/me during app initialization. `providedIn: 'root'` singleton.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly currentUserSignal = signal<EmployeeResponse | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(stryMutAct_9fa48("28") ? () => undefined : (stryCov_9fa48("28"), () => stryMutAct_9fa48("31") ? this.tokenSignal() === null : stryMutAct_9fa48("30") ? false : stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29", "30", "31"), this.tokenSignal() !== null)));
  login(credentials: LoginRequest): Observable<AuthResponse> {
    if (stryMutAct_9fa48("32")) {
      {}
    } else {
      stryCov_9fa48("32");
      return this.http.post<AuthResponse>(stryMutAct_9fa48("33") ? `` : (stryCov_9fa48("33"), `${this.apiUrl}/auth/login`), credentials).pipe(tap(response => {
        if (stryMutAct_9fa48("34")) {
          {}
        } else {
          stryCov_9fa48("34");
          this.setToken(response.token);
          this.currentUserSignal.set(stryMutAct_9fa48("35") ? {} : (stryCov_9fa48("35"), {
            id: response.employeeId,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName
          }));
        }
      }));
    }
  }
  loadCurrentUser(): Observable<EmployeeResponse> {
    if (stryMutAct_9fa48("36")) {
      {}
    } else {
      stryCov_9fa48("36");
      return this.http.get<EmployeeResponse>(stryMutAct_9fa48("37") ? `` : (stryCov_9fa48("37"), `${this.apiUrl}/auth/me`)).pipe(tap(stryMutAct_9fa48("38") ? () => undefined : (stryCov_9fa48("38"), user => this.currentUserSignal.set(user))));
    }
  }
  logout(): void {
    if (stryMutAct_9fa48("39")) {
      {}
    } else {
      stryCov_9fa48("39");
      localStorage.removeItem(TOKEN_KEY);
      this.tokenSignal.set(null);
      this.currentUserSignal.set(null);
    }
  }
  getToken(): string | null {
    if (stryMutAct_9fa48("40")) {
      {}
    } else {
      stryCov_9fa48("40");
      return this.tokenSignal();
    }
  }
  private setToken(token: string): void {
    if (stryMutAct_9fa48("41")) {
      {}
    } else {
      stryCov_9fa48("41");
      localStorage.setItem(TOKEN_KEY, token);
      this.tokenSignal.set(token);
    }
  }
}