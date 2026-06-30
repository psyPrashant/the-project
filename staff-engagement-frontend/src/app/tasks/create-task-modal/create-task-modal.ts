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
  selector: 'app-create-task-modal',
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './create-task-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTaskModalComponent {
  private readonly taskService = inject(TaskService);
  private readonly employeeService = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  /** When provided, the "Relates to" field is pre-filled and locked. */
  readonly relatesToId = input<number | undefined>(undefined);

  readonly saved = output<Task>();
  readonly closed = output<void>();

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly employees = signal<EmployeeProfileResponse[]>([]);

  protected readonly form = new FormGroup({
    relatesToId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true }),
    assigneeId: new FormControl<number | null>(null)
  });

  private employeesLoaded = false;

  constructor() {
    effect(() => {
      if (!this.open()) return;
      if (!this.employeesLoaded) {
        this.employeesLoaded = true;
        this.employeeService.getAll()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: list => this.employees.set(list) });
      }
      this.errorMessage.set(null);
      this.submitting.set(false);
      const prefilledId = this.relatesToId() ?? null;
      this.form.reset({ relatesToId: prefilledId, title: '', description: '', dueDate: '', assigneeId: null });
      if (prefilledId !== null) {
        this.form.controls.relatesToId.disable();
      } else {
        this.form.controls.relatesToId.enable();
      }
    });
  }

  protected get relatesToLocked(): boolean {
    return this.relatesToId() !== undefined;
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    if (raw.relatesToId === null) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.taskService.createStandalone({
      relatesToId: raw.relatesToId,
      title: raw.title,
      description: raw.description || undefined,
      dueDate: raw.dueDate || undefined,
      assigneeId: raw.assigneeId ?? undefined
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: created => {
        this.submitting.set(false);
        this.saved.emit(created);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Failed to create task. Please try again.');
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }
}
