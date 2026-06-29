// @ts-nocheck
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
    // Authenticate first so a token actually exists in the service's state.
    service.login({ email: 'admin@psybergate.com', password: 'password123' }).subscribe();
    httpTesting.expectOne('http://localhost:8080/api/auth/login').flush(authResponse);

    service.loadCurrentUser().subscribe();
    httpTesting.expectOne('http://localhost:8080/api/auth/me').flush({
      id: 42, email: 'admin@psybergate.com', firstName: 'Admin', lastName: 'User'
    });

    expect(service.currentUser()?.id).toBe(42);
  });

  it('clears token and user on logout', () => {
    // Establish an authenticated session through the real API path.
    service.login({ email: 'admin@psybergate.com', password: 'password123' }).subscribe();
    httpTesting.expectOne('http://localhost:8080/api/auth/login').flush(authResponse);
    expect(service.isAuthenticated()).toBe(true); // precondition

    service.logout();

    expect(localStorage.getItem('se_token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });
});

describe('AuthService (initial user on reload)', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    // A token is already present (e.g. the user reloaded the page). The service must NOT
    // fabricate a placeholder user; the real one is resolved later by loadCurrentUser() via
    // the app initializer. The token signal is seeded from localStorage at construction.
    localStorage.setItem('se_token', 'leftover-token');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('starts with a null current user even when a token is already present', () => {
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toBeNull();
  });
});