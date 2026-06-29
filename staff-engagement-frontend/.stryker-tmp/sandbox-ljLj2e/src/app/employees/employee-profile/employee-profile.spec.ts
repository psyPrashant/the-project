// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EmployeeProfileComponent } from './employee-profile';
import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';

const mockEmployee: EmployeeProfileResponse = {
  id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com',
  jobTitle: 'Engineer', department: 'Tech', phone: null, archived: false
};

type ProfileInstance = {
  employee(): EmployeeProfileResponse | null;
  loading(): boolean;
  archive(): void;
};

describe('EmployeeProfileComponent', () => {
  let serviceSpy: Partial<EmployeeService>;

  beforeEach(() => {
    serviceSpy = {
      getProfile: vi.fn().mockReturnValue(of(mockEmployee)),
      archive: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.configureTestingModule({
      imports: [EmployeeProfileComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
  });

  it('displays the employee name and email', () => {
    const fixture = TestBed.createComponent(EmployeeProfileComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Alice');
    expect(text).toContain('alice@example.com');
  });

  it('renders empty-but-present Interactions, Tasks, and Portfolio sections', () => {
    const fixture = TestBed.createComponent(EmployeeProfileComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Interactions');
    expect(text).toContain('Tasks');
    expect(text).toContain('Portfolio');
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
    const archiveBtn = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(archiveBtn).toBeNull();
  });
});
