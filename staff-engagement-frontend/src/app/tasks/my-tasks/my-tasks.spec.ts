import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { MyTasksComponent } from './my-tasks';
import { TaskService } from '../task.service';
import { AuthService } from '../../auth/auth.service';
import { EmployeeService } from '../../employees/employee.service';
import { Task } from '../task.models';

const mockEmployee = { id: 1, email: 'a@example.com', firstName: 'A', lastName: 'B' };
const otherEmployee = { id: 9, email: 'other@example.com', firstName: 'Other', lastName: 'User' };

const openTask: Task = {
  id: 1,
  title: 'Open task',
  description: null,
  status: 'OPEN',
  relatesTo: mockEmployee,
  createdBy: mockEmployee,
  fromInteractionId: null,
  dueDate: null,
  assignee: null,
  createdAt: '2026-06-29T10:00:00',
  updatedAt: '2026-06-29T10:00:00'
};

const doneTask: Task = { ...openTask, id: 2, title: 'Done task', status: 'DONE' };

const openTaskByOther: Task = {
  ...openTask,
  id: 3,
  title: 'Other person task',
  createdBy: otherEmployee,
  relatesTo: otherEmployee
};

describe('MyTasksComponent', () => {
  let taskService: {
    getMyTasks: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    createStandalone: ReturnType<typeof vi.fn>;
  };
  const currentUser = signal(mockEmployee);

  beforeEach(() => {
    taskService = {
      getMyTasks: vi.fn().mockReturnValue(of([openTask, doneTask])),
      updateStatus: vi.fn().mockReturnValue(of({ ...openTask, status: 'DONE' })),
      update: vi.fn().mockReturnValue(of(openTask)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      createStandalone: vi.fn().mockReturnValue(of(openTask))
    };

    TestBed.configureTestingModule({
      imports: [MyTasksComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskService },
        { provide: AuthService, useValue: { currentUser, loadCurrentUser: vi.fn().mockReturnValue(of(mockEmployee)) } },
        { provide: EmployeeService, useValue: { getAll: vi.fn().mockReturnValue(of([])) } }
      ]
    });
  });

  it('renders open and done task lists', async () => {
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[aria-label="Open tasks"]')).toBeTruthy();
    expect(el.querySelector('[aria-label="Done tasks"]')).toBeTruthy();
    expect(el.textContent).toContain('Open task');
    expect(el.textContent).toContain('Done task');
  });

  it('shows empty state when no tasks', async () => {
    taskService.getMyTasks.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No tasks yet');
  });

  it('markDone() calls updateStatus and updates the task in the list', async () => {
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as { markDone: (t: Task) => void };
    component.markDone(openTask);
    fixture.detectChanges();

    expect(taskService.updateStatus).toHaveBeenCalledWith(openTask.id, { status: 'DONE' });
  });

  it('shows error message when getMyTasks fails', async () => {
    taskService.getMyTasks.mockReturnValue(throwError(() => new Error('Network error')));
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Failed to load tasks');
  });

  it('places open tasks in the Open section and done tasks in the Done section', async () => {
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const openSection = el.querySelector('[aria-label="Open tasks"]');
    const doneSection = el.querySelector('[aria-label="Done tasks"]');

    expect(openSection?.textContent).toContain('Open task');
    expect(openSection?.textContent).not.toContain('Done task');
    expect(doneSection?.textContent).toContain('Done task');
    expect(doneSection?.textContent).not.toContain('Open task');
  });

  it('sets loading to true while tasks are being fetched and false once loaded', async () => {
    const subject = new Subject<Task[]>();
    taskService.getMyTasks.mockReturnValue(subject.asObservable());

    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fixture.componentInstance as any).loading()).toBe(true);

    subject.next([openTask]);
    fixture.detectChanges();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fixture.componentInstance as any).loading()).toBe(false);
  });

  it('markDone() only replaces the targeted task when multiple tasks are open', async () => {
    const secondOpen: Task = { ...openTask, id: 2, title: 'Second open task', status: 'OPEN' };
    taskService.getMyTasks.mockReturnValue(of([openTask, secondOpen]));
    taskService.updateStatus.mockReturnValue(of({ ...openTask, status: 'DONE' }));

    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any).markDone(openTask);
    await fixture.whenStable();
    fixture.detectChanges();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = fixture.componentInstance as any;
    expect(comp.openTasks()).toHaveLength(1);
    expect(comp.openTasks()[0].id).toBe(2);
    expect(comp.doneTasks()).toHaveLength(1);
    expect(comp.doneTasks()[0].id).toBe(1);
  });

  it('shows Reopen button on done tasks', async () => {
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const reopenBtn = el.querySelector('[aria-label="Reopen task: Done task"]');
    expect(reopenBtn).toBeTruthy();
  });

  it('reopenTask() calls updateStatus with OPEN and moves task back to open section', async () => {
    const reopened: Task = { ...doneTask, status: 'OPEN' };
    taskService.updateStatus.mockReturnValue(of(reopened));
    taskService.getMyTasks.mockReturnValue(of([doneTask]));

    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any).reopenTask(doneTask);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(taskService.updateStatus).toHaveBeenCalledWith(doneTask.id, { status: 'OPEN' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = fixture.componentInstance as any;
    expect(comp.openTasks()).toHaveLength(1);
    expect(comp.doneTasks()).toHaveLength(0);
  });

  it('shows edit button only for tasks the current user can edit (creator or subject)', async () => {
    taskService.getMyTasks.mockReturnValue(of([openTask, openTaskByOther]));
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const editBtns: NodeListOf<HTMLButtonElement> = el.querySelectorAll('button[aria-label^="Edit task"]');
    const labels = Array.from(editBtns).map(b => b.getAttribute('aria-label'));
    expect(labels).toContain('Edit task: Open task');
    expect(labels).not.toContain('Edit task: Other person task');
  });

  it('shows delete button only for tasks the current user created', async () => {
    taskService.getMyTasks.mockReturnValue(of([openTask, openTaskByOther]));
    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const deleteBtns: NodeListOf<HTMLButtonElement> = el.querySelectorAll('button[aria-label^="Delete task"]');
    const labels = Array.from(deleteBtns).map(b => b.getAttribute('aria-label'));
    expect(labels).toContain('Delete task: Open task');
    expect(labels).not.toContain('Delete task: Other person task');
  });

  it('deleteTask() calls taskService.delete and removes task from list', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    taskService.getMyTasks.mockReturnValue(of([openTask]));

    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any).deleteTask(openTask);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(taskService.delete).toHaveBeenCalledWith(openTask.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fixture.componentInstance as any).openTasks()).toHaveLength(0);
  });

  it('deleteTask() does not call taskService.delete when user cancels confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    taskService.getMyTasks.mockReturnValue(of([openTask]));

    const fixture = TestBed.createComponent(MyTasksComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any).deleteTask(openTask);

    expect(taskService.delete).not.toHaveBeenCalled();
  });
});
