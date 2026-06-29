import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { HomeComponent } from './home';
import { AuthService } from '../auth/auth.service';

type MockUser = { id: number; email: string; firstName: string; lastName: string };

describe('HomeComponent', () => {
  let authService: { currentUser: ReturnType<typeof signal<MockUser | null>>; logout: ReturnType<typeof vi.fn> };

  function configure(user: MockUser | null) {
    const userSignal = signal<MockUser | null>(user);
    authService = { currentUser: userSignal.asReadonly() as ReturnType<typeof signal<MockUser | null>>, logout: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    });
  }

  it('shows personalised greeting when a user is logged in', () => {
    configure({ id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' });
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Welcome, Alice');
  });

  it('shows generic greeting when no user is loaded', () => {
    configure(null);
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Welcome');
    expect(text).not.toContain('Welcome, ');
  });

  it('calls authService.logout() and navigates to /login when logout() is called', async () => {
    configure({ id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' });
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any)['logout']();

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
