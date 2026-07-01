import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { CreateTaskComponent } from './create-task';
import { TaskService } from '../task.service';
import { EmployeeService } from '../../employees/employee.service';
import { Task } from '../task.models';

const mockEmployeeList = [
  { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith', jobTitle: null, department: null, phone: null, archived: false },
  { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones', jobTitle: null, department: null, phone: null, archived: false }
];

const createdTask: Task = {
  id: 10,
  title: 'New standalone task',
  description: null,
  status: 'OPEN',
  relatesTo: { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' },
  createdBy: { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones' },
  fromInteractionId: null,
  dueDate: null,
  assignee: null,
  createdAt: '2026-06-29T10:00:00',
  updatedAt: '2026-06-29T10:00:00'
};

describe('CreateTaskComponent', () => {
  let taskService: { createStandalone: ReturnType<typeof vi.fn> };
  let employeeService: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    taskService = { createStandalone: vi.fn().mockReturnValue(of(createdTask)) };
    employeeService = { getAll: vi.fn().mockReturnValue(of(mockEmployeeList)) };

    TestBed.configureTestingModule({
      imports: [CreateTaskComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskService },
        { provide: EmployeeService, useValue: employeeService }
      ]
    });
  });

  it('renders form with required fields', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#relatesToId')).toBeTruthy();
    expect(el.querySelector('#title')).toBeTruthy();
    expect(el.querySelector('#dueDate')).toBeTruthy();
    expect(el.querySelector('#assigneeId')).toBeTruthy();
  });

  it('shows validation error when title is empty and form is submitted', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component['form'].controls.relatesToId.setValue(1);
    component['onSubmit']();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Title is required');
  });

  it('calls createStandalone with correct payload on valid submit', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const component = fixture.componentInstance;
    component['form'].setValue({ relatesToId: 1, title: 'New standalone task', description: '', dueDate: '', assigneeId: null });
    component['onSubmit']();

    expect(taskService.createStandalone).toHaveBeenCalledWith(expect.objectContaining({
      relatesToId: 1,
      title: 'New standalone task'
    }));
  });

  it('passes non-empty description through to the service', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance['form'].setValue({ relatesToId: 1, title: 'Task', description: 'Some description', dueDate: '', assigneeId: null });
    fixture.componentInstance['onSubmit']();

    expect(taskService.createStandalone).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Some description'
    }));
  });

  it('maps empty description to undefined before calling the service', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance['form'].setValue({ relatesToId: 1, title: 'Task', description: '', dueDate: '', assigneeId: null });
    fixture.componentInstance['onSubmit']();

    expect(taskService.createStandalone).toHaveBeenCalledWith(expect.objectContaining({
      description: undefined
    }));
  });

  it('navigates to /tasks after successful submit', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance['form'].setValue({ relatesToId: 1, title: 'Task', description: '', dueDate: '', assigneeId: null });
    fixture.componentInstance['onSubmit']();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/tasks']);
  });

  it('passes non-empty dueDate through to the service', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance['form'].setValue({ relatesToId: 1, title: 'Task', description: '', dueDate: '2026-12-31', assigneeId: null });
    fixture.componentInstance['onSubmit']();

    expect(taskService.createStandalone).toHaveBeenCalledWith(expect.objectContaining({ dueDate: '2026-12-31' }));
  });

  it('maps empty dueDate to undefined before calling the service', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance['form'].setValue({ relatesToId: 1, title: 'Task', description: '', dueDate: '', assigneeId: null });
    fixture.componentInstance['onSubmit']();

    expect(taskService.createStandalone).toHaveBeenCalledWith(expect.objectContaining({ dueDate: undefined }));
  });

  it('is invalid when relatesToId is null', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance['form'].patchValue({ title: 'Task', relatesToId: null });

    expect(fixture.componentInstance['form'].invalid).toBe(true);
  });

  it('populates the employees signal after getAll() resolves', async () => {
    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance['employees']()).toEqual(mockEmployeeList);
  });

  it('sets submitting to true while the request is in flight then false on success', async () => {
    const subject = new Subject<typeof createdTask>();
    taskService.createStandalone.mockReturnValue(subject.asObservable());

    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture.componentInstance['form'].setValue({ relatesToId: 1, title: 'Task', description: '', dueDate: '', assigneeId: null });
    fixture.componentInstance['onSubmit']();

    expect(fixture.componentInstance['submitting']()).toBe(true);

    subject.next(createdTask);
    await fixture.whenStable();

    expect(fixture.componentInstance['submitting']()).toBe(false);
  });

  it('resets submitting to false on service error', async () => {
    const subject = new Subject<typeof createdTask>();
    taskService.createStandalone.mockReturnValue(subject.asObservable());

    const fixture = TestBed.createComponent(CreateTaskComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance['form'].setValue({ relatesToId: 1, title: 'Task', description: '', dueDate: '', assigneeId: null });
    fixture.componentInstance['onSubmit']();

    subject.error(new Error('fail'));
    fixture.detectChanges();

    expect(fixture.componentInstance['submitting']()).toBe(false);
  });
});
