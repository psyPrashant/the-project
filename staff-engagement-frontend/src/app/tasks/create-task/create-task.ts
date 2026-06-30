import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { TaskService } from '../task.service';

interface CreateTaskForm {
  relatesToId: FormControl<number | null>;
  title: FormControl<string>;
  description: FormControl<string>;
  dueDate: FormControl<string>;
  assigneeId: FormControl<number | null>;
}

@Component({
  selector: 'app-create-task',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-task.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTaskComponent {
  private readonly taskService = inject(TaskService);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly employees = signal<EmployeeProfileResponse[]>([]);
  protected readonly loadingEmployees = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup<CreateTaskForm>({
    relatesToId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true }),
    assigneeId: new FormControl<number | null>(null)
  });

  constructor() {
    this.employeeService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: list => {
          this.employees.set(list);
          this.loadingEmployees.set(false);
        },
        error: () => {
          this.loadingEmployees.set(false);
          this.errorMessage.set('Failed to load employees.');
        }
      });
  }

  protected onSubmit(): void {
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
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          void this.router.navigate(['/tasks/mine']);
        },
        error: () => {
          this.submitting.set(false);
          this.errorMessage.set('Failed to create task. Please try again.');
        }
      });
  }

  protected cancel(): void {
    void this.router.navigate(['/tasks/mine']);
  }
}
