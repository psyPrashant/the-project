import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeFormComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly employeeId = signal<number | undefined>(
    this.route.snapshot.paramMap.get('id')
      ? Number(this.route.snapshot.paramMap.get('id'))
      : undefined
  );
  protected readonly isEdit = signal(this.employeeId() !== undefined);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    jobTitle: new FormControl('', { nonNullable: true }),
    department: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true })
  });

  constructor() {
    const id = this.employeeId();
    if (id !== undefined) {
      this.employeeService.getProfile(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: emp => {
            this.form.patchValue({
              firstName: emp.firstName,
              lastName: emp.lastName,
              email: emp.email,
              jobTitle: emp.jobTitle ?? '',
              department: emp.department ?? '',
              phone: emp.phone ?? ''
            });
          },
          error: () => this.errorMessage.set('Failed to load employee data.')
        });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
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

    const id = this.employeeId();
    const operation = id !== undefined
      ? this.employeeService.update(id, request)
      : this.employeeService.create(request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: employee => {
        this.submitting.set(false);
        void this.router.navigate(['/employees', employee.id]);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Failed to save employee. Please try again.');
      }
    });
  }

  protected cancel(): void {
    const id = this.employeeId();
    void this.router.navigate(id !== undefined ? ['/employees', id] : ['/employees']);
  }
}
