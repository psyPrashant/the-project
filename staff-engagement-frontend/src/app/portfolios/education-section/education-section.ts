import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PortfolioService } from '../portfolio.service';
import { EducationResponse } from '../portfolio.models';

@Component({
  selector: 'app-education-section',
  imports: [ReactiveFormsModule],
  templateUrl: './education-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducationSectionComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly employeeId = input.required<number>();
  readonly education = input.required<EducationResponse[]>();
  readonly changed = output<void>();

  protected readonly editingId = signal<number | 'new' | null>(null);
  protected readonly submitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly form = new FormGroup({
    institution: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    qualification: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fieldOfStudy: new FormControl('', { nonNullable: true }),
    startYear: new FormControl<number | null>(null),
    endYear: new FormControl<number | null>(null),
    description: new FormControl('', { nonNullable: true })
  });

  protected startNew(): void {
    this.form.reset();
    this.editingId.set('new');
  }

  protected startEdit(education: EducationResponse): void {
    this.form.patchValue({
      institution: education.institution,
      qualification: education.qualification,
      fieldOfStudy: education.fieldOfStudy ?? '',
      startYear: education.startYear,
      endYear: education.endYear,
      description: education.description ?? ''
    });
    this.editingId.set(education.id);
  }

  protected cancel(): void {
    this.editingId.set(null);
    this.form.reset();
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);

    const id = this.editingId();
    if (id === null) return;

    const { institution, qualification, fieldOfStudy, startYear, endYear, description } = this.form.getRawValue();
    const request = {
      institution,
      qualification,
      fieldOfStudy: fieldOfStudy || undefined,
      startYear,
      endYear,
      description: description || undefined
    };

    const operation = id === 'new'
      ? this.portfolioService.addEducation(this.employeeId(), request)
      : this.portfolioService.updateEducation(this.employeeId(), id, request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting.set(false);
        this.editingId.set(null);
        this.form.reset();
        this.changed.emit();
      },
      error: () => this.submitting.set(false)
    });
  }

  protected deleteEducation(id: number): void {
    this.deletingId.set(id);
    this.portfolioService.deleteEducation(this.employeeId(), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingId.set(null);
          this.changed.emit();
        },
        error: () => this.deletingId.set(null)
      });
  }
}
