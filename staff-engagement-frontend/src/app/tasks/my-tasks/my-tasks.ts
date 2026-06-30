import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { TaskService } from '../task.service';
import { Task } from '../task.models';

@Component({
  selector: 'app-my-tasks',
  imports: [RouterLink],
  templateUrl: './my-tasks.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyTasksComponent {
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly markingDoneId = signal<number | null>(null);

  protected readonly openTasks = computed(() => this.tasks().filter(t => t.status === 'OPEN'));
  protected readonly doneTasks = computed(() => this.tasks().filter(t => t.status === 'DONE'));

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.taskService.getMyTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: tasks => {
          this.tasks.set(tasks);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Failed to load tasks. Please try again.');
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
