import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { ModalComponent } from '../../shell/modal/modal';
import { TaskService } from '../task.service';
import { Task } from '../task.models';

@Component({
  selector: 'app-task-edit-modal',
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './task-edit-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskEditModalComponent {
  private readonly taskService = inject(TaskService);
  private readonly employeeService = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly task = input<Task | null>(null);

  readonly saved = output<Task>();
  readonly closed = output<void>();

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly employees = signal<EmployeeProfileResponse[]>([]);

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true }),
    assigneeId: new FormControl<number | null>(null)
  });

  constructor() {
    this.employeeService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: list => this.employees.set(list) });

    effect(() => {
      if (!this.open()) return;
      const t = this.task();
      this.errorMessage.set(null);
      this.submitting.set(false);
      this.form.reset({
        title: t?.title ?? '',
        description: t?.description ?? '',
        dueDate: t?.dueDate ?? '',
        assigneeId: t?.assignee?.id ?? null
      });
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const t = this.task();
    if (!t) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { title, description, dueDate, assigneeId } = this.form.getRawValue();
    this.taskService.update(t.id, {
      title,
      description: description || undefined,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId ?? undefined
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: updated => {
        this.submitting.set(false);
        this.saved.emit(updated);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Failed to save task. Please try again.');
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }
}
