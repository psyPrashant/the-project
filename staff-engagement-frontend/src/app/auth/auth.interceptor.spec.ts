import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

const authResponse = {
  token: 'jwt-token',
  employeeId: 42,
  email: 'admin@psybergate.com',
  firstName: 'Admin',
  lastName: 'User'
};

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class Stub {} }])
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpTesting.verify());

  // Authenticates the service through its real login path so a token actually lives in its
  // signal-backed state (setting localStorage directly no longer authenticates, by design).
  function authenticate(): void {
    authService.login({ email: 'admin@psybergate.com', password: 'password123' }).subscribe();
    httpTesting.expectOne('http://localhost:8080/api/auth/login').flush(authResponse);
  }

  it('does not add Authorization when there is no token', () => {
    http.get('http://localhost:8080/api/employees').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('http://localhost:8080/api/employees');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('adds Bearer token when authenticated', () => {
    authenticate();
    expect(authService.isAuthenticated()).toBe(true);

    http.get('http://localhost:8080/api/employees').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('http://localhost:8080/api/employees');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush([]);
  });

  it('does not attach a token to the login request', () => {
    // Even when a token already exists from a prior session, a login request must never carry it.
    authenticate();

    authService.login({ email: 'other@psybergate.com', password: 'pw' }).subscribe({ error: () => {} });

    const req = httpTesting.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('logs out and redirects to /login on a 401', () => {
    authenticate();
    expect(authService.isAuthenticated()).toBe(true); // precondition: authenticated

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('http://localhost:8080/api/employees').subscribe({ error: () => {} });
    httpTesting.expectOne('http://localhost:8080/api/employees')
      .flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    // The 401 branch must log out — clearing both the token and the reactive authenticated
    // state — and redirect to /login.
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getToken()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});