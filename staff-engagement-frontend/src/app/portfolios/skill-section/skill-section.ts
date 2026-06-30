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

import { SkillsService } from '../../skills/skills.service';
import { EmployeeSkillResponse } from '../../skills/skills.models';

@Component({
  selector: 'app-skill-section',
  imports: [ReactiveFormsModule],
  templateUrl: './skill-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillSectionComponent {
  private readonly skillsService = inject(SkillsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly employeeId = input.required<number>();
  readonly skills = input.required<EmployeeSkillResponse[]>();
  readonly changed = output<void>();

  protected readonly showForm = signal(false);
  protected readonly submitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    skillName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    years: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] })
  });

  protected startAdd(): void {
    this.form.reset({ skillName: '', years: 0 });
    this.saveError.set(null);
    this.showForm.set(true);
  }

  protected cancel(): void {
    this.showForm.set(false);
    this.saveError.set(null);
    this.form.reset();
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.saveError.set(null);

    const { skillName, years } = this.form.getRawValue();
    this.skillsService.addSkill(this.employeeId(), { skillName, years })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.form.reset();
          this.changed.emit();
        },
        error: (err) => {
          this.submitting.set(false);
          this.saveError.set(err?.error?.message ?? 'Failed to add skill.');
        }
      });
  }

  protected deleteSkill(skillId: number): void {
    this.deletingId.set(skillId);
    this.skillsService.deleteSkill(this.employeeId(), skillId)
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
