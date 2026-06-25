import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, afterEach, beforeEach, describe, it, expect } from 'vitest';

import { EmployeeListComponent } from './employee-list';
import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';

const mockEmployees: EmployeeProfileResponse[] = [
  { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: 'Dev', department: 'Tech', phone: null, archived: false },
  { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', jobTitle: null, department: null, phone: null, archived: false }
];

describe('EmployeeListComponent', () => {
  let employeeServiceSpy: Partial<EmployeeService>;

  beforeEach(() => {
    vi.useFakeTimers();
    employeeServiceSpy = {
      getAll: vi.fn().mockReturnValue(of(mockEmployees))
    };

    TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: employeeServiceSpy }
      ]
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders employee names from the service', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Alice');
    expect(text).toContain('Bob');
  });

  it('shows empty state when no employees returned', () => {
    (employeeServiceSpy.getAll as ReturnType<typeof vi.fn>).mockReturnValue(of([]));
    const fixture = TestBed.createComponent(EmployeeListComponent);
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No employees found');
  });

  it('navigates to employee profile on row click', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    const row = (fixture.nativeElement as HTMLElement).querySelector('[aria-label]') as HTMLElement;
    row?.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/employees', 1]);
  });

  it('contains a link to create a new employee', () => {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="/employees/new"]');
    expect(link).not.toBeNull();
  });
});
