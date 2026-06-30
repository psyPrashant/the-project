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
import { RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { TaskService } from '../task.service';
import { Task } from '../task.models';

@Component({
  selector: 'app-tasks-section',
  imports: [RouterLink],
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

  protected canMarkDone(task: Task): boolean {
    const user = this.currentUser();
    if (user === null) return false;
    return task.createdBy.id === user.id || task.relatesTo.id === user.id;
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
