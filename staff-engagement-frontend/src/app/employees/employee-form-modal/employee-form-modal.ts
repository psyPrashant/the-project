import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';
import { ModalComponent } from '../../shell/modal/modal';

/**
 * Add / edit an employee in a modal (TSP-44), replacing the old standalone form route. The parent
 * owns `open`; on a successful save the resulting employee is emitted via `saved`.
 */
@Component({
  selector: 'app-employee-form-modal',
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './employee-form-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeFormModalComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly employee = input<EmployeeProfileResponse | null>(null);

  readonly saved = output<EmployeeProfileResponse>();
  readonly closed = output<void>();

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEdit = computed(() => this.employee() !== null);

  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    jobTitle: new FormControl('', { nonNullable: true }),
    department: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true })
  });

  constructor() {
    // Reset and (for edit) populate the form each time the modal opens.
    effect(() => {
      if (!this.open()) {
        return;
      }
      const emp = this.employee();
      this.errorMessage.set(null);
      this.submitting.set(false);
      this.form.reset({ firstName: '', lastName: '', email: '', jobTitle: '', department: '', phone: '' });
      if (emp) {
        this.form.patchValue({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          jobTitle: emp.jobTitle ?? '',
          department: emp.department ?? '',
          phone: emp.phone ?? ''
        });
      }
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);

    const { firstName, lastName, email, jobTitle, department, phone } = this.form.getRawValue();
    const request = {
      firstName,
      lastName,
      email,
      jobTitle: jobTitle || undefined,
      department: department || undefined,
      phone: phone || undefined
    };

    const emp = this.employee();
    const operation = emp
      ? this.employeeService.update(emp.id, request)
      : this.employeeService.create(request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
        this.submitting.set(false);
        this.saved.emit(saved);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Failed to save employee. Please try again.');
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }
}
