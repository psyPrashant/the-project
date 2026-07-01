import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi, afterEach, beforeEach, describe, it, expect } from 'vitest';

import { EmployeeListComponent } from './employee-list';
import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';

const activeEmployee: EmployeeProfileResponse = { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: 'Dev', department: 'Tech', phone: null, archived: false };
const archivedEmployee: EmployeeProfileResponse = { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', jobTitle: null, department: null, phone: null, archived: true };
const mockEmployees: EmployeeProfileResponse[] = [activeEmployee];

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

  function render() {
    const fixture = TestBed.createComponent(EmployeeListComponent);
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    return fixture;
  }

  it('renders active employees as cards with names', () => {
    const fixture = render();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Alice Smith');
  });

  it('links each person to their profile under /people', () => {
    const fixture = render();
    const link = (fixture.nativeElement as HTMLElement).querySelector(
      'a[href="/people/1"]'
    );
    expect(link).not.toBeNull();
  });

  it('shows empty state when no employees returned', () => {
    (employeeServiceSpy.getAll as ReturnType<typeof vi.fn>).mockReturnValue(of([]));
    const fixture = render();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No people found');
  });

  it('has an Add employee button', () => {
    const fixture = render();
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find(b => b.textContent?.includes('Add employee'));
    expect(button).toBeTruthy();
  });

  it('has a Show archived toggle defaulting to unchecked', () => {
    const fixture = render();
    const checkbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#show-archived');
    expect(checkbox).not.toBeNull();
    expect(checkbox?.checked).toBe(false);
  });

  it('calls getAll with includeArchived=true when toggle is checked', () => {
    (employeeServiceSpy.getAll as ReturnType<typeof vi.fn>).mockReturnValue(of([activeEmployee, archivedEmployee]));
    const fixture = render();
    const checkbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#show-archived')!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(employeeServiceSpy.getAll).toHaveBeenCalledWith(undefined, true);
  });

  it('shows archived employee with Archived badge when toggle is on', () => {
    (employeeServiceSpy.getAll as ReturnType<typeof vi.fn>).mockReturnValue(of([activeEmployee, archivedEmployee]));
    const fixture = render();
    const checkbox = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#show-archived')!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Bob Jones');
    expect(text).toContain('Archived');
  });

  it('calls getAll without includeArchived when toggle is off', () => {
    const fixture = render();
    expect(employeeServiceSpy.getAll).toHaveBeenCalledWith(undefined, undefined);
  });
});
