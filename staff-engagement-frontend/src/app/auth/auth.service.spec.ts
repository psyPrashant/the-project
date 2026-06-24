import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { AuthResponse } from './auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  const authResponse: AuthResponse = {
    token: 'jwt-token',
    employeeId: 42,
    email: 'admin@psybergate.com',
    firstName: 'Admin',
    lastName: 'User'
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('stores the token and current user on successful login', () => {
    service.login({ email: 'admin@psybergate.com', password: 'password123' }).subscribe();

    const req = httpTesting.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(authResponse);

    expect(localStorage.getItem('se_token')).toBe('jwt-token');
    expect(service.currentUser()?.firstName).toBe('Admin');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('does not store a token on failed login', () => {
    service.login({ email: 'admin@psybergate.com', password: 'wrong' }).subscribe({
      error: () => {}
    });

    httpTesting.expectOne('http://localhost:8080/api/auth/login').flush(
      { status: 401, message: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' }
    );

    expect(localStorage.getItem('se_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('populates the current user from /auth/me', () => {
    localStorage.setItem('se_token', 'jwt-token');
    service.loadCurrentUser().subscribe();

    httpTesting.expectOne('http://localhost:8080/api/auth/me').flush({
      id: 42, email: 'admin@psybergate.com', firstName: 'Admin', lastName: 'User'
    });

    expect(service.currentUser()?.id).toBe(42);
  });

  it('clears token and user on logout', () => {
    localStorage.setItem('se_token', 'jwt-token');
    service.logout();

    expect(localStorage.getItem('se_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});