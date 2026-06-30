import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { TasksSectionComponent } from './tasks-section';
import { TaskService } from '../task.service';
import { AuthService } from '../../auth/auth.service';
import { EmployeeService } from '../../employees/employee.service';
import { Task } from '../task.models';

const currentUserId = 1;
const otherUserId = 9;

const currentUserEmployee = { id: currentUserId, email: 'me@example.com', firstName: 'Me', lastName: 'User' };
const creatorEmployee = { id: otherUserId, email: 'other@example.com', firstName: 'Other', lastName: 'User' };
const subjectEmployee = { id: 2, email: 'subject@example.com', firstName: 'Subject', lastName: 'Person' };

const openTaskByMe: Task = {
  id: 1, title: 'My open task', description: null, status: 'OPEN',
  relatesTo: subjectEmployee, createdBy: currentUserEmployee,
  fromInteractionId: null, dueDate: null, assignee: null,
  createdAt: '2026-06-30T10:00:00', updatedAt: '2026-06-30T10:00:00'
};

const openTaskByOther: Task = {
  id: 2, title: 'Someone else task', description: 'A note', status: 'OPEN',
  relatesTo: subjectEmployee, createdBy: creatorEmployee,
  fromInteractionId: null, dueDate: '2026-12-31', assignee: null,
  createdAt: '2026-06-30T10:00:00', updatedAt: '2026-06-30T10:00:00'
};

const doneTask: Task = {
  id: 3, title: 'Done task', description: null, status: 'DONE',
  relatesTo: subjectEmployee, createdBy: currentUserEmployee,
  fromInteractionId: null, dueDate: null, assignee: null,
  createdAt: '2026-06-30T10:00:00', updatedAt: '2026-06-30T10:00:00'
};

describe('TasksSectionComponent', () => {
  let taskService: {
    getByEmployee: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    createStandalone: ReturnType<typeof vi.fn>;
    canEdit: ReturnType<typeof vi.fn>;
    canDelete: ReturnType<typeof vi.fn>;
  };
  const currentUser = signal(currentUserEmployee);

  beforeEach(() => {
    taskService = {
      getByEmployee: vi.fn().mockReturnValue(of([openTaskByMe, openTaskByOther, doneTask])),
      updateStatus: vi.fn().mockReturnValue(of({ ...openTaskByMe, status: 'DONE' })),
      update: vi.fn().mockReturnValue(of(openTaskByMe)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      createStandalone: vi.fn().mockReturnValue(of(openTaskByMe)),
      canEdit: vi.fn((task, user) => user !== null && (task.createdBy.id === user.id || task.relatesTo.id === user.id)),
      canDelete: vi.fn((task, user) => user !== null && task.createdBy.id === user.id)
    };

    TestBed.configureTestingModule({
      imports: [TasksSectionComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskService },
        { provide: AuthService, useValue: { currentUser, loadCurrentUser: vi.fn().mockReturnValue(of(currentUserEmployee)) } },
        { provide: EmployeeService, useValue: { getAll: vi.fn().mockReturnValue(of([])) } }
      ]
    });
  });

  function createFixture(subjectId = 2) {
    const fixture = TestBed.createComponent(TasksSectionComponent);
    fixture.componentRef.setInput('subjectId', subjectId);
    fixture.detectChanges();
    return fixture;
  }

  it('renders open and done tasks', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[aria-label="Open tasks"]')).toBeTruthy();
    expect(el.querySelector('[aria-label="Done tasks"]')).toBeTruthy();
    expect(el.textContent).toContain('My open task');
    expect(el.textContent).toContain('Someone else task');
    expect(el.textContent).toContain('Done task');
  });

  it('shows empty state when employee has no tasks', async () => {
    taskService.getByEmployee.mockReturnValue(of([]));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No tasks yet');
  });

  it('shows "Mark done" button only for tasks the current user can update', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button[aria-label^="Mark task done"]');
    const labels = Array.from(buttons).map(b => b.getAttribute('aria-label'));
    expect(labels).toContain('Mark task done: My open task');
    expect(labels).not.toContain('Mark task done: Someone else task');
  });

  it('calls updateStatus and moves task to done when "Mark done" clicked', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as { markDone: (t: Task) => void };
    comp.markDone(openTaskByMe);
    fixture.detectChanges();

    expect(taskService.updateStatus).toHaveBeenCalledWith(openTaskByMe.id, { status: 'DONE' });
  });

  it('shows error when getByEmployee fails', async () => {
    taskService.getByEmployee.mockReturnValue(throwError(() => new Error('Network error')));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Failed to load tasks');
  });

  it('shows creator name and due date on tasks', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Other User');
    expect(el.textContent).toContain('2026-12-31');
  });

  it('shows Reopen button on done tasks the current user can update', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const reopenBtn = el.querySelector('[aria-label="Reopen task: Done task"]');
    expect(reopenBtn).toBeTruthy();
  });

  it('reopenTask() calls updateStatus with OPEN', async () => {
    const reopened: Task = { ...doneTask, status: 'OPEN' };
    taskService.updateStatus.mockReturnValue(of(reopened));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any).reopenTask(doneTask);
    await fixture.whenStable();

    expect(taskService.updateStatus).toHaveBeenCalledWith(doneTask.id, { status: 'OPEN' });
  });

  it('shows edit button only for tasks the current user can edit', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const editBtns: NodeListOf<HTMLButtonElement> = el.querySelectorAll('button[aria-label^="Edit task"]');
    const labels = Array.from(editBtns).map(b => b.getAttribute('aria-label'));
    expect(labels).toContain('Edit task: My open task');
    expect(labels).not.toContain('Edit task: Someone else task');
  });

  it('shows delete button only for tasks the current user created', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const deleteBtns: NodeListOf<HTMLButtonElement> = el.querySelectorAll('button[aria-label^="Delete task"]');
    const labels = Array.from(deleteBtns).map(b => b.getAttribute('aria-label'));
    expect(labels).toContain('Delete task: My open task');
    expect(labels).not.toContain('Delete task: Someone else task');
  });

  it('deleteTask() calls taskService.delete and removes task from list', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    taskService.getByEmployee.mockReturnValue(of([openTaskByMe]));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any).deleteTask(openTaskByMe);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(taskService.delete).toHaveBeenCalledWith(openTaskByMe.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fixture.componentInstance as any).openTasks()).toHaveLength(0);
  });

  it('deleteTask() does nothing when user cancels confirm', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = createFixture();
    await fixture.whenStable();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fixture.componentInstance as any).deleteTask(openTaskByMe);

    expect(taskService.delete).not.toHaveBeenCalled();
  });
});
