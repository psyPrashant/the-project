import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { EmployeeProfileComponent } from './employee-profile';
import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';
import { PortfolioService } from '../../portfolios/portfolio.service';
import { InteractionService } from '../../interactions/interaction.service';
import { AuthService } from '../../auth/auth.service';

const mockEmployee: EmployeeProfileResponse = {
  id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com',
  jobTitle: 'Engineer', department: 'Tech', phone: null, archived: false
};

const emptyPortfolio = { employeeId: 1, education: [], projects: [], links: [] };

type ProfileInstance = {
  employee(): EmployeeProfileResponse | null;
  archive(): void;
};

describe('EmployeeProfileComponent', () => {
  let serviceSpy: Partial<EmployeeService>;

  beforeEach(() => {
    serviceSpy = {
      getProfile: vi.fn().mockReturnValue(of(mockEmployee)),
      getAll: vi.fn().mockReturnValue(of([mockEmployee])),
      archive: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.configureTestingModule({
      imports: [EmployeeProfileComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: serviceSpy },
        { provide: PortfolioService, useValue: { getPortfolio: vi.fn().mockReturnValue(of(emptyPortfolio)) } },
        { provide: InteractionService, useValue: { findBySubject: vi.fn().mockReturnValue(of([])) } },
        { provide: AuthService, useValue: { currentUser: signal(null), loadCurrentUser: () => of(mockEmployee) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
  });

  it('displays the employee name and email', () => {
    const fixture = TestBed.createComponent(EmployeeProfileComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Alice Smith');
    expect(text).toContain('alice@example.com');
  });

  it('renders interactions, tasks/skills placeholders and portfolio sections', () => {
    const fixture = TestBed.createComponent(EmployeeProfileComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Interactions');
    expect(text).toContain('Tasks');
    expect(text).toContain('Skills');
    expect(text).toContain('Projects');
    expect(text).toContain('Education');
    expect(text).toContain('Public links');
  });

  it('calls archive() on the service and reflects archived state', () => {
    const fixture = TestBed.createComponent(EmployeeProfileComponent);
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as ProfileInstance;

    c.archive();

    expect(serviceSpy.archive).toHaveBeenCalledWith(1);
    expect(c.employee()?.archived).toBe(true);
  });

  it('hides the Archive button when already archived', () => {
    (serviceSpy.getProfile as ReturnType<typeof vi.fn>).mockReturnValue(
      of({ ...mockEmployee, archived: true })
    );
    const fixture = TestBed.createComponent(EmployeeProfileComponent);
    fixture.detectChanges();
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    const archiveButton = buttons.find(b => b.textContent?.trim().startsWith('Archive'));
    expect(archiveButton).toBeUndefined();
  });
});
