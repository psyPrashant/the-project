import { TestBed } from '@angular/core/testing';
import { provideRouter, RedirectCommand, Router } from '@angular/router';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const runGuard = (url: string) =>
    TestBed.runInInjectionContext(() => authGuard({} as any, { url } as any));

  it('allows activation when authenticated', () => {
    localStorage.setItem('se_token', 'jwt-token');
    expect(runGuard('/home')).toBe(true);
  });

  it('redirects to /login with the redirect query param when unauthenticated', () => {
    const result = runGuard('/home');
    expect(result).toBeInstanceOf(RedirectCommand);
    expect((result as unknown as { redirectTo: { queryParams: Record<string, string> } }).redirectTo.queryParams['redirect']).toBe('/home');
  });

  it('redirects unauthenticated users specifically to /login', () => {
    const result = runGuard('/dashboard') as RedirectCommand;
    const router = TestBed.inject(Router);
    expect(router.serializeUrl(result.redirectTo)).toContain('/login');
  });
});