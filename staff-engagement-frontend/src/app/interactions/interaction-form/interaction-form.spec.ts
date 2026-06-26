import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, afterEach, beforeEach, describe, it, expect } from 'vitest';

import { InteractionFormComponent } from './interaction-form';
import { InteractionService } from '../interaction.service';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionResponse, InteractionType } from '../interaction.models';

const mockEmployees: EmployeeProfileResponse[] = [
  { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: 'Dev', department: 'Tech', phone: null, archived: false },
  { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', jobTitle: null, department: null, phone: null, archived: false }
];

const mockInteraction: InteractionResponse = {
  id: 10,
  author: { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' },
  subject: { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones' },
  note: 'Call notes',
  type: InteractionType.CALL,
  date: '2026-06-25'
};

type FormControlLike = {
  invalid: boolean;
  touched: boolean;
  setValue(v: unknown): void;
};

type FormInstance = {
  form: {
    invalid: boolean;
    controls: {
      subjectId: FormControlLike;
      type: FormControlLike;
      date: FormControlLike;
      note: FormControlLike;
    };
    patchValue(v: Record<string, unknown>): void;
    getRawValue(): Record<string, unknown>;
    markAllAsTouched(): void;
  };
  onSubmit(): void;
};

function createActivatedRouteStub(queryParams: Record<string, string>): Partial<ActivatedRoute> {
  return {
    snapshot: {
      queryParamMap: {
        get: (key: string) => queryParams[key] ?? null,
        has: (key: string) => key in queryParams,
        getAll: () => [],
        keys: Object.keys(queryParams)
      }
    } as unknown as ActivatedRoute['snapshot']
  };
}

describe('InteractionFormComponent', () => {
  let interactionServiceSpy: Partial<InteractionService>;
  let employeeServiceSpy: Partial<EmployeeService>;

  beforeEach(() => {
    interactionServiceSpy = {
      create: vi.fn().mockReturnValue(of(mockInteraction))
    };
    employeeServiceSpy = {
      getAll: vi.fn().mockReturnValue(of(mockEmployees))
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function configureTestBed(queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      imports: [InteractionFormComponent],
      providers: [
        provideRouter([]),
        { provide: InteractionService, useValue: interactionServiceSpy },
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteStub(queryParams) }
      ]
    });
  }

  it('renders employee options and pre-selects subject from query param', () => {
    configureTestBed({ subjectId: '2' });
    const fixture = TestBed.createComponent(InteractionFormComponent);
    fixture.detectChanges();

    const select = (fixture.nativeElement as HTMLElement).querySelector('#subjectId') as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.value).toBe('2');
    expect(select.disabled).toBe(true);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Alice Smith');
    expect(text).toContain('Bob Jones');
  });

  it('marks required fields and shows validation errors after submit attempt', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionFormComponent);
    const c = fixture.componentInstance as unknown as FormInstance;
    fixture.detectChanges();

    c.form.controls.note.setValue('');
    c.form.controls.date.setValue('');

    c.onSubmit();
    fixture.detectChanges();

    expect(c.form.controls.subjectId.invalid).toBe(true);
    expect(c.form.controls.note.invalid).toBe(true);
    expect(c.form.controls.date.invalid).toBe(true);

    const alerts = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="alert"]');
    const alertText = Array.from(alerts).map(a => a.textContent).join(' ');
    expect(alertText).toContain('Subject is required');
    expect(alertText).toContain('Note is required');
    expect(alertText).toContain('Date is required');
  });

  it('submits valid interaction and navigates to subject timeline', async () => {
    configureTestBed({ subjectId: '2' });
    const fixture = TestBed.createComponent(InteractionFormComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance as unknown as FormInstance;
    fixture.detectChanges();

    c.form.patchValue({
      subjectId: 2,
      type: InteractionType.CALL,
      date: '2026-06-25',
      note: 'Call notes'
    });

    c.onSubmit();
    fixture.detectChanges();

    expect(interactionServiceSpy.create).toHaveBeenCalledWith({
      subjectId: 2,
      type: InteractionType.CALL,
      date: '2026-06-25',
      note: 'Call notes'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/employees', 2, 'interactions']);
  });

  it('displays error message when create fails', () => {
    (interactionServiceSpy.create as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('Server error')));
    configureTestBed({ subjectId: '2' });
    const fixture = TestBed.createComponent(InteractionFormComponent);
    const c = fixture.componentInstance as unknown as FormInstance;
    fixture.detectChanges();

    c.form.patchValue({
      subjectId: 2,
      type: InteractionType.NOTE,
      date: '2026-06-25',
      note: 'Note'
    });

    c.onSubmit();
    fixture.detectChanges();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Server error');
  });
});
