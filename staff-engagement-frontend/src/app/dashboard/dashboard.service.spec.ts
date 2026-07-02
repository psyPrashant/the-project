import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { DashboardService } from './dashboard.service';
import { DashboardResponse } from './dashboard.models';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTesting: HttpTestingController;
  const apiBase = 'http://localhost:8080/api';

  const mockDashboard: DashboardResponse = {
    workforcePulse: { totalEmployees: 12, employeesWithSkills: 8, openTasks: 5, interactionsThisWeek: 7 },
    actionNeeded: [{ employeeId: 3, employeeName: 'John Smith', reason: 'No skills recorded' }],
    recentActivity: [
      {
        type: 'interactions',
        actorName: 'Admin User',
        targetEmployeeId: 2,
        targetEmployeeName: 'Jane Doe',
        description: 'Logged interaction',
        occurredAt: '2026-07-01T14:30:00Z'
      }
    ],
    skillCoverage: {
      topSkills: [{ skillId: 1, skillName: 'Angular', employeeCount: 5 }],
      orphanedSkills: [{ skillId: 9, skillName: 'Rust', employeeCount: 0 }]
    },
    me: { employeeId: 1, employeeName: 'Admin User', skillCount: 3, openTaskCount: 2, recentInteractionCount: 4 }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(DashboardService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('getDashboard() fetches the aggregate dashboard endpoint', () => {
    let result: DashboardResponse | undefined;
    service.getDashboard().subscribe(r => (result = r));
    httpTesting.expectOne(`${apiBase}/dashboard`).flush(mockDashboard);
    expect(result).toEqual(mockDashboard);
  });
});
