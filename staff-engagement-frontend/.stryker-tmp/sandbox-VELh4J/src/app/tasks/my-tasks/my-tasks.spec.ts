// @ts-nocheck
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { MyTasksComponent } from './my-tasks';
import { TaskService } from '../task.service';
import { Task } from '../task.models';

const mockEmployee = { id: 1, email: 'a@example.com', firstName: 'A', lastName: 'B' };

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

describe('MyTasksComponent', () => {
  let taskService: { getMyTasks: ReturnType<typeof vi.fn>; updateStatus: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    taskService = {
      getMyTasks: vi.fn().mockReturnValue(of([openTask, doneTask])),
      updateStatus: vi.fn().mockReturnValue(of({ ...openTask, status: 'DONE' }))
    };

    TestBed.configureTestingModule({
      imports: [MyTasksComponent],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: taskService }
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
});
