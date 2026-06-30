import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { EmployeeFormComponent } from './employee-form';
import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';

const mockEmployee: EmployeeProfileResponse = {
  id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com',
  jobTitle: 'Engineer', department: 'Tech', phone: '555-0001', archived: false
};

type FormInstance = {
  form: { invalid: boolean; valid: boolean; setValue(v: unknown): void; getRawValue(): unknown };
  onSubmit(): void;
  isEdit(): boolean;
};

describe('EmployeeFormComponent — create mode', () => {
  let serviceSpy: Partial<EmployeeService>;

  beforeEach(() => {
    serviceSpy = { create: vi.fn().mockReturnValue(of(mockEmployee)) };

    TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    });
  });

  it('form is invalid when empty', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    expect(c.form.invalid).toBe(true);
  });

  it('form is valid when all required fields are filled', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '' });
    expect(c.form.valid).toBe(true);
  });

  it('form is invalid for a malformed email', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'not-an-email', jobTitle: '', department: '', phone: '' });
    expect(c.form.invalid).toBe(true);
  });

  it('calls create() on submit in create mode', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '' });
    c.onSubmit();
    expect(serviceSpy.create).toHaveBeenCalledTimes(1);
  });

  it('isEdit() returns false in create mode', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    expect(c.isEdit()).toBe(false);
  });

  it('submitting starts as false', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as { submitting: () => boolean };
    expect(c.submitting()).toBe(false);
  });

  it('navigates to the employee profile after a successful create', async () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '' });
    c.onSubmit();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/employees', mockEmployee.id]);
  });

  it('passes a non-empty jobTitle through to the service', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: 'Engineer', department: '', phone: '' });
    c.onSubmit();
    expect(serviceSpy.create).toHaveBeenCalledWith(expect.objectContaining({ jobTitle: 'Engineer' }));
  });

  it('maps an empty jobTitle to undefined before calling the service', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '' });
    c.onSubmit();
    expect(serviceSpy.create).toHaveBeenCalledWith(expect.objectContaining({ jobTitle: undefined }));
  });

  it('maps an empty department to undefined before calling the service', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '' });
    c.onSubmit();
    expect(serviceSpy.create).toHaveBeenCalledWith(expect.objectContaining({ department: undefined }));
  });

  it('passes non-empty phone through to the service', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '555-1234' });
    c.onSubmit();
    expect(serviceSpy.create).toHaveBeenCalledWith(expect.objectContaining({ phone: '555-1234' }));
  });

  it('maps empty phone to undefined before calling the service', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '' });
    c.onSubmit();
    expect(serviceSpy.create).toHaveBeenCalledWith(expect.objectContaining({ phone: undefined }));
  });

  it('does not call create() when the form is invalid', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    c.onSubmit();
    expect(serviceSpy.create).not.toHaveBeenCalled();
  });

  it('sets submitting to true while the request is in flight and false on success', async () => {
    const subject = new Subject<typeof mockEmployee>();
    (serviceSpy.create as ReturnType<typeof vi.fn>).mockReturnValue(subject.asObservable());

    const fixture = TestBed.createComponent(EmployeeFormComponent);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const c = fixture.componentInstance as unknown as FormInstance;
    c.form.setValue({ firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', jobTitle: '', department: '', phone: '' });
    c.onSubmit();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fixture.componentInstance as any)['submitting']()).toBe(true);

    subject.next(mockEmployee);
    await fixture.whenStable();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fixture.componentInstance as any)['submitting']()).toBe(false);
  });
});

describe('EmployeeFormComponent — edit mode', () => {
  let serviceSpy: Partial<EmployeeService>;

  beforeEach(() => {
    serviceSpy = {
      getProfile: vi.fn().mockReturnValue(of(mockEmployee)),
      update: vi.fn().mockReturnValue(of(mockEmployee))
    };

    TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
      providers: [
        provideRouter([]),
        { provide: EmployeeService, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    });
  });

  it('pre-fills the form with the existing employee data', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    const v = c.form.getRawValue() as Record<string, string>;
    expect(v['firstName']).toBe('Alice');
    expect(v['email']).toBe('alice@example.com');
    expect(v['jobTitle']).toBe('Engineer');
  });

  it('calls update() on submit in edit mode', () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance as unknown as FormInstance;
    c.onSubmit();
    expect(serviceSpy.update).toHaveBeenCalledWith(1, expect.objectContaining({ firstName: 'Alice' }));
  });

  it('isEdit() returns true in edit mode', () => {
    const c = TestBed.createComponent(EmployeeFormComponent).componentInstance as unknown as FormInstance;
    expect(c.isEdit()).toBe(true);
  });

  it('navigates to the employee profile after a successful update', async () => {
    const fixture = TestBed.createComponent(EmployeeFormComponent);
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance as unknown as FormInstance;
    c.onSubmit();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/employees', mockEmployee.id]);
  });
});
