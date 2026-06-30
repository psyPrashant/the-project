import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { TaskService } from '../task.service';
import { Task } from '../task.models';
import { TaskEditModalComponent } from '../task-edit-modal/task-edit-modal';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal';

@Component({
  selector: 'app-tasks-section',
  imports: [TaskEditModalComponent, CreateTaskModalComponent],
  templateUrl: './tasks-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksSectionComponent {
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly subjectId = input.required<number>();

  protected readonly currentUser = this.authService.currentUser;

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly markingDoneId = signal<number | null>(null);
  protected readonly reopeningId = signal<number | null>(null);
  protected readonly editingTask = signal<Task | null>(null);
  protected readonly createModalOpen = signal(false);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly openTasks = computed(() => this.tasks().filter(t => t.status === 'OPEN'));
  protected readonly doneTasks = computed(() => this.tasks().filter(t => t.status === 'DONE'));

  constructor() {
    if (this.currentUser() === null) {
      this.authService.loadCurrentUser()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: () => { /* best-effort */ } });
    }

    effect(() => {
      const id = this.subjectId();
      if (id > 0) {
        this.load(id);
      }
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.taskService.getByEmployee(id)
      .pipe(
        catchError(() => {
          this.loading.set(false);
          this.errorMessage.set('Failed to load tasks.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(tasks => {
        this.tasks.set(tasks);
        this.loading.set(false);
      });
  }

  protected canEdit(task: Task): boolean {
    const user = this.currentUser();
    if (user === null) return false;
    return task.createdBy.id === user.id || task.relatesTo.id === user.id;
  }

  protected isCreator(task: Task): boolean {
    const user = this.currentUser();
    return user !== null && task.createdBy.id === user.id;
  }

  protected deleteTask(task: Task): void {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    this.deletingId.set(task.id);
    this.errorMessage.set(null);
    this.taskService.delete(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.tasks.update(list => list.filter(t => t.id !== task.id));
          this.deletingId.set(null);
        },
        error: () => {
          this.deletingId.set(null);
          this.errorMessage.set('Failed to delete task. Please try again.');
        }
      });
  }

  protected onTaskCreated(task: Task): void {
    this.tasks.update(list => [...list, task]);
    this.createModalOpen.set(false);
  }

  protected openEditModal(task: Task): void {
    this.editingTask.set(task);
  }

  protected closeEditModal(): void {
    this.editingTask.set(null);
  }

  protected onTaskEdited(updated: Task): void {
    this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
    this.editingTask.set(null);
  }

  protected canMarkDone(task: Task): boolean {
    const user = this.currentUser();
    if (user === null) return false;
    return task.createdBy.id === user.id || task.relatesTo.id === user.id;
  }

  protected reopenTask(task: Task): void {
    this.reopeningId.set(task.id);
    this.errorMessage.set(null);
    this.taskService.updateStatus(task.id, { status: 'OPEN' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.reopeningId.set(null);
        },
        error: () => {
          this.reopeningId.set(null);
          this.errorMessage.set('Failed to reopen task. Please try again.');
        }
      });
  }

  protected markDone(task: Task): void {
    this.markingDoneId.set(task.id);
    this.errorMessage.set(null);
    this.taskService.updateStatus(task.id, { status: 'DONE' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.markingDoneId.set(null);
        },
        error: () => {
          this.markingDoneId.set(null);
          this.errorMessage.set('Failed to update task. Please try again.');
        }
      });
  }
}
