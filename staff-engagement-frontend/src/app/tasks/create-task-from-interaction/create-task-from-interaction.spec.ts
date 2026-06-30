import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { CreateTaskFromInteractionComponent } from './create-task-from-interaction';
import { TaskService } from '../task.service';
import { EmployeeService } from '../../employees/employee.service';
import { Task } from '../task.models';

const mockEmployeeList = [
  { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith', jobTitle: null, department: null, phone: null, archived: false },
  { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones', jobTitle: null, department: null, phone: null, archived: false }
];

const createdTask: Task = {
  id: 10,
  title: 'Follow-up task',
  description: null,
  status: 'OPEN',
  relatesTo: { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' },
  createdBy: { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones' },
  fromInteractionId: 5,
  dueDate: null,
  assignee: null,
  createdAt: '2026-06-29T10:00:00',
  updatedAt: '2026-06-29T10:00:00'
};

describe('CreateTaskFromInteractionComponent', () => {
  let taskService: { createFromInteraction: ReturnType<typeof vi.fn> };
  let employeeService: { getAll: ReturnType<typeof vi.fn> };

  function configure(routeId: string | null) {
    TestBed.configureTestingModule({
      imports: [CreateTaskFromInteractionComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (key: string) => key === 'id' ? routeId : null } } }
        },
        { provide: TaskService, useValue: taskService },
        { provide: EmployeeService, useValue: employeeService }
      ]
    });
  }

  beforeEach(() => {
    taskService = { createFromInteraction: vi.fn().mockReturnValue(of(createdTask)) };
    employeeService = { getAll: vi.fn().mockReturnValue(of(mockEmployeeList)) };
  });

  describe('with a valid interaction id', () => {
    beforeEach(() => configure('5'));

    it('renders form with title and assignee fields', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('#title')).toBeTruthy();
      expect(el.querySelector('#assigneeId')).toBeTruthy();
    });

    it('shows validation error when title is empty on submit', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.componentInstance['onSubmit']();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Title is required');
    });

    it('calls createFromInteraction with non-empty description passed through', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      const component = fixture.componentInstance;
      component['form'].controls.title.setValue('Follow-up task');
      component['form'].controls.description.setValue('Some detail');
      component['onSubmit']();

      expect(taskService.createFromInteraction).toHaveBeenCalledWith(expect.objectContaining({
        interactionId: 5,
        title: 'Follow-up task',
        description: 'Some detail'
      }));
    });

    it('maps empty description to undefined before calling the service', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      const component = fixture.componentInstance;
      component['form'].controls.title.setValue('Follow-up task');
      component['form'].controls.description.setValue('');
      component['onSubmit']();

      expect(taskService.createFromInteraction).toHaveBeenCalledWith(expect.objectContaining({
        description: undefined
      }));
    });

    it('navigates to /tasks/mine after successful submit', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      fixture.componentInstance['form'].controls.title.setValue('Follow-up task');
      fixture.componentInstance['onSubmit']();
      await fixture.whenStable();

      expect(navigateSpy).toHaveBeenCalledWith(['/tasks/mine']);
    });

    it('shows error message when createFromInteraction fails', async () => {
      taskService.createFromInteraction.mockReturnValue(throwError(() => new Error('API error')));
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.componentInstance['form'].controls.title.setValue('Follow-up task');
      fixture.componentInstance['onSubmit']();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Failed to create task');
    });

    it('shows error message when employee list fails to load', async () => {
      employeeService.getAll.mockReturnValue(throwError(() => new Error('Network error')));
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('Failed to load employees');
    });

    it('passes non-empty dueDate through to the service', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      fixture.componentInstance['form'].controls.title.setValue('Follow-up task');
      fixture.componentInstance['form'].controls.dueDate.setValue('2026-12-31');
      fixture.componentInstance['onSubmit']();

      expect(taskService.createFromInteraction).toHaveBeenCalledWith(expect.objectContaining({ dueDate: '2026-12-31' }));
    });

    it('maps empty dueDate to undefined before calling the service', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      fixture.componentInstance['form'].controls.title.setValue('Follow-up task');
      fixture.componentInstance['form'].controls.dueDate.setValue('');
      fixture.componentInstance['onSubmit']();

      expect(taskService.createFromInteraction).toHaveBeenCalledWith(expect.objectContaining({ dueDate: undefined }));
    });

    it('populates the employees signal after getAll() resolves', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance['employees']()).toEqual(mockEmployeeList);
    });

    it('sets loadingEmployees to false after the employee list loads', async () => {
      const subject = new Subject<typeof mockEmployeeList>();
      employeeService.getAll.mockReturnValue(subject.asObservable());

      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance['loadingEmployees']()).toBe(true);

      subject.next(mockEmployeeList);
      fixture.detectChanges();

      expect(fixture.componentInstance['loadingEmployees']()).toBe(false);
    });

    it('sets loadingEmployees to false when employee list load fails', async () => {
      const subject = new Subject<typeof mockEmployeeList>();
      employeeService.getAll.mockReturnValue(subject.asObservable());

      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();

      subject.error(new Error('fail'));
      fixture.detectChanges();

      expect(fixture.componentInstance['loadingEmployees']()).toBe(false);
    });

    it('sets submitting to true while the request is in flight then false on success', async () => {
      const subject = new Subject<typeof createdTask>();
      taskService.createFromInteraction.mockReturnValue(subject.asObservable());

      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

      fixture.componentInstance['form'].controls.title.setValue('Follow-up task');
      fixture.componentInstance['onSubmit']();

      expect(fixture.componentInstance['submitting']()).toBe(true);

      subject.next(createdTask);
      await fixture.whenStable();

      expect(fixture.componentInstance['submitting']()).toBe(false);
    });

    it('resets submitting to false on service error', async () => {
      const subject = new Subject<typeof createdTask>();
      taskService.createFromInteraction.mockReturnValue(subject.asObservable());

      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.componentInstance['form'].controls.title.setValue('Follow-up task');
      fixture.componentInstance['onSubmit']();

      subject.error(new Error('fail'));
      fixture.detectChanges();

      expect(fixture.componentInstance['submitting']()).toBe(false);
    });
  });

  describe('with an invalid interaction id', () => {
    beforeEach(() => configure('0'));

    it('shows an error and does not call the employee service', async () => {
      const fixture = TestBed.createComponent(CreateTaskFromInteractionComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.textContent).toContain('Invalid interaction reference');
      expect(employeeService.getAll).not.toHaveBeenCalled();
    });
  });
});
