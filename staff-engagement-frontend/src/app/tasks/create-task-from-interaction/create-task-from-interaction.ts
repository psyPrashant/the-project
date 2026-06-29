import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { TaskService } from '../task.service';

interface CreateFromInteractionForm {
  title: FormControl<string>;
  description: FormControl<string>;
  dueDate: FormControl<string>;
  assigneeId: FormControl<number | null>;
}

@Component({
  selector: 'app-create-task-from-interaction',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-task-from-interaction.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTaskFromInteractionComponent {
  private readonly taskService = inject(TaskService);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly interactionId = signal(Number(this.route.snapshot.paramMap.get('id')));
  protected readonly employees = signal<EmployeeProfileResponse[]>([]);
  protected readonly loadingEmployees = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup<CreateFromInteractionForm>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    dueDate: new FormControl('', { nonNullable: true }),
    assigneeId: new FormControl<number | null>(null)
  });

  constructor() {
    if (!Number.isFinite(this.interactionId()) || this.interactionId() <= 0) {
      this.loadingEmployees.set(false);
      this.errorMessage.set('Invalid interaction reference. Please go back and try again.');
      return;
    }

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
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.taskService.createFromInteraction({
      interactionId: this.interactionId(),
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
