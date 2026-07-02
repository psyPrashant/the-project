import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { DashboardComponent } from './dashboard';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../auth/auth.service';
import { ActivityType, DashboardResponse } from './dashboard.models';

describe('DashboardComponent', () => {
  let dashboardSpy: Partial<DashboardService>;
  let authSpy: Partial<AuthService>;

  const mockDashboard: DashboardResponse = {
    workforcePulse: { totalEmployees: 12, employeesWithSkills: 8, openTasks: 5, interactionsThisWeek: 7 },
    actionNeeded: [{ employeeId: 3, employeeName: 'John Smith', reason: 'No skills recorded' }],
    recentActivity: [
      {
        type: 'interactions',
        actorName: 'Admin User',
        targetEmployeeId: 2,
        targetEmployeeName: 'Jane Doe',
        description: 'Logged interaction with',
        occurredAt: '2026-07-01T14:30:00Z'
      },
      {
        type: 'tasks',
        actorName: 'Admin User',
        targetEmployeeId: 2,
        targetEmployeeName: 'Jane Doe',
        description: 'Created task for',
        occurredAt: '2026-07-01T10:00:00Z'
      }
    ],
    skillCoverage: {
      topSkills: [{ skillId: 1, skillName: 'Angular', employeeCount: 5 }],
      orphanedSkills: [{ skillId: 9, skillName: 'Rust', employeeCount: 0 }]
    },
    me: { employeeId: 1, employeeName: 'Admin User', skillCount: 3, openTaskCount: 2, recentInteractionCount: 4 }
  };

  beforeEach(() => {
    dashboardSpy = { getDashboard: vi.fn().mockReturnValue(of(mockDashboard)) };
    authSpy = { currentUser: signal({ id: 1, email: 'admin@example.com', firstName: 'Admin', lastName: 'User' }) };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardSpy },
        { provide: AuthService, useValue: authSpy },
        provideRouter([])
      ]
    });
  });

  it('shows a loading state while data loads', () => {
    const subject = new Subject<DashboardResponse>();
    (dashboardSpy.getDashboard as ReturnType<typeof vi.fn>).mockReturnValue(subject.asObservable());

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Loading dashboard');
    subject.next(mockDashboard);
    subject.complete();
  });

  it('renders pulse tile values on load', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('12');
    expect(text).toContain('Total employees');
    expect(text).toContain('8');
    expect(text).toContain('Employees with skills');
    expect(text).toContain('5');
    expect(text).toContain('Open tasks');
    expect(text).toContain('7');
    expect(text).toContain('Interactions this week');
  });

  it('lists action-needed items with names and reasons', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('John Smith');
    expect(text).toContain('No skills recorded');
  });

  it('shows the empty action-needed message when there are no items', () => {
    const emptyDashboard = { ...mockDashboard, actionNeeded: [] };
    (dashboardSpy.getDashboard as ReturnType<typeof vi.fn>).mockReturnValue(of(emptyDashboard));

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('All caught up');
  });

  it('renders the recent activity feed', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Logged interaction with');
    expect(text).toContain('Jane Doe');
  });

  it('filters the activity feed by type when a filter chip is clicked', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const taskFilterButton = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Filter activity"] button:nth-child(5)'
    ) as HTMLButtonElement;
    expect(taskFilterButton).toBeTruthy();
    taskFilterButton.click();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Created task for');
    expect(text).not.toContain('Logged interaction with');
  });

  it('shows the empty activity message when the filter matches nothing', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const peopleFilterButton = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Filter activity"] button:nth-child(2)'
    ) as HTMLButtonElement;
    peopleFilterButton.click();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No recent activity matches this filter.');
  });

  it('renders skill coverage top skills and orphaned skills', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Angular');
    expect(text).toContain('Rust');
  });

  it('renders the signed-in user Me card', () => {
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Admin User');
    expect(text).toContain('Skills');
    expect(text).toContain('Tasks');
    expect(text).toContain('Interactions');
  });

  it('displays an error message when dashboard loading fails', () => {
    (dashboardSpy.getDashboard as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Failed to load dashboard');
  });
});
