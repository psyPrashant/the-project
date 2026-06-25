import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

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

  it('does not add Authorization when there is no token', () => {
    http.get('http://localhost:8080/api/employees').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('http://localhost:8080/api/employees');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('adds Bearer token when authenticated', () => {
    localStorage.setItem('se_token', 'jwt-token');
    expect(authService.isAuthenticated()).toBe(true);

    http.get('http://localhost:8080/api/employees').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('http://localhost:8080/api/employees');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush([]);
  });

  it('does not attach a token to the login request', () => {
    localStorage.setItem('se_token', 'jwt-token');

    http.post('http://localhost:8080/api/auth/login', {}).subscribe({ error: () => {} });

    const req = httpTesting.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('logs out and redirects to /login on a 401', () => {
    localStorage.setItem('se_token', 'jwt-token');
    expect(localStorage.getItem('se_token')).toBe('jwt-token'); // precondition: authenticated

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('http://localhost:8080/api/employees').subscribe({ error: () => {} });
    httpTesting.expectOne('http://localhost:8080/api/employees')
      .flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    // The 401 branch must log out (clearing the token) and redirect to /login.
    expect(localStorage.getItem('se_token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});