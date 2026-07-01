import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { AppShellComponent } from './app-shell';
import { AuthService } from '../../auth/auth.service';
import { EmployeeResponse } from '../../auth/auth.models';

describe('AppShellComponent', () => {
  const currentUser = signal<EmployeeResponse | null>({
    id: 7,
    email: 'priya@acme.co',
    firstName: 'Priya',
    lastName: 'Naidoo'
  });
  const logout = vi.fn();

  beforeEach(() => {
    logout.mockClear();
    TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser, logout } }
      ]
    });
  });

  it('shows the signed-in user name and initials', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Priya Naidoo');
    expect(text).toContain('PN');
  });

  it('renders primary navigation links', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('My Dashboard');
    expect(text).toContain('People');
    expect(text).toContain('Skills Register');
    expect(text).toContain('My Tasks');
  });

  it('signs out and navigates to login', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const signOut = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Sign out"]'
    ) as HTMLButtonElement;
    signOut.click();

    expect(logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
