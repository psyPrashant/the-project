import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionService } from '../interaction.service';
import { InteractionResponse, InteractionType } from '../interaction.models';

interface InteractionForm {
  subjectId: FormControl<number | null>;
  type: FormControl<InteractionType>;
  date: FormControl<string>;
  note: FormControl<string>;
}

@Component({
  selector: 'app-interaction-form',
  imports: [ReactiveFormsModule],
  templateUrl: './interaction-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionFormComponent {
  private readonly interactionService = inject(InteractionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly employees = signal<EmployeeProfileResponse[]>([]);
  protected readonly loadingEmployees = signal(true);
  protected readonly loadingInteraction = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly interactionTypes = Object.values(InteractionType);

  protected readonly interactionId = signal<number | undefined>(
    this.route.snapshot.paramMap.get('id')
      ? Number(this.route.snapshot.paramMap.get('id'))
      : undefined
  );

  protected readonly subjectIdParam = signal<number | undefined>(
    this.route.snapshot.queryParamMap.get('subjectId')
      ? Number(this.route.snapshot.queryParamMap.get('subjectId'))
      : undefined
  );

  protected readonly isEditMode = computed(() => this.interactionId() !== undefined);

  protected readonly form = new FormGroup<InteractionForm>({
    subjectId: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.required] }),
    type: new FormControl<InteractionType>(InteractionType.NOTE, { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    note: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    const subjectId = this.subjectIdParam();
    if (this.isEditMode()) {
      this.loadingInteraction.set(true);
      this.form.disable();
      const id = this.interactionId();
      if (id !== undefined) {
        this.interactionService.findById(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: interaction => {
              this.patchForm(interaction);
              this.loadingInteraction.set(false);
              this.form.enable();
              this.form.controls.subjectId.disable();
            },
            error: () => {
              this.loadingInteraction.set(false);
              this.form.enable();
              this.errorMessage.set('Failed to load interaction.');
            }
          });
      }
    } else {
      if (subjectId !== undefined) {
        this.form.controls.subjectId.setValue(subjectId);
        this.form.controls.subjectId.disable();
      }

      afterNextRender(() => {
        this.form.controls.date.setValue(this.formatDate(new Date()));
      });
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

  private patchForm(interaction: InteractionResponse): void {
    this.form.patchValue({
      subjectId: interaction.subject.id,
      type: interaction.type,
      date: interaction.date,
      note: interaction.note
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    if (rawValue.subjectId === null || rawValue.subjectId === undefined) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request = {
      subjectId: rawValue.subjectId,
      type: rawValue.type,
      date: rawValue.date,
      note: rawValue.note
    };

    const id = this.interactionId();
    const operation = id !== undefined
      ? this.interactionService.update(id, request)
      : this.interactionService.create(request);

    operation
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: interaction => {
          this.submitting.set(false);
          void this.router.navigate(['/employees', interaction.subject.id, 'interactions']);
        },
        error: err => {
          this.submitting.set(false);
          this.errorMessage.set(this.extractErrorMessage(err));
        }
      });
  }

  protected cancel(): void {
    const rawValue = this.form.getRawValue();
    const subjectId = rawValue.subjectId ?? this.subjectIdParam();
    void this.router.navigate(subjectId !== undefined && subjectId !== null
      ? ['/employees', subjectId, 'interactions']
      : ['/employees']
    );
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private extractErrorMessage(err: unknown): string {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'object' && err !== null && 'error' in err && typeof err.error === 'string') {
      return err.error;
    }
    if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string') {
      return err.message;
    }
    return 'Failed to save interaction. Please try again.';
  }
}
