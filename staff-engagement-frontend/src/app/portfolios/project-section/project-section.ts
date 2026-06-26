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
import { ProjectResponse } from '../portfolio.models';

@Component({
  selector: 'app-project-section',
  imports: [ReactiveFormsModule],
  templateUrl: './project-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectSectionComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly employeeId = input.required<number>();
  readonly projects = input.required<ProjectResponse[]>();
  readonly changed = output<void>();

  protected readonly editingId = signal<number | 'new' | null>(null);
  protected readonly submitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    startDate: new FormControl('', { nonNullable: true }),
    endDate: new FormControl('', { nonNullable: true }),
    url: new FormControl('', { nonNullable: true })
  });

  protected startNew(): void {
    this.form.reset();
    this.editingId.set('new');
  }

  protected startEdit(project: ProjectResponse): void {
    this.form.patchValue({
      name: project.name,
      description: project.description ?? '',
      startDate: project.startDate ?? '',
      endDate: project.endDate ?? '',
      url: project.url ?? ''
    });
    this.editingId.set(project.id);
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

    const { name, description, startDate, endDate, url } = this.form.getRawValue();
    const request = {
      name,
      description: description || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      url: url || undefined
    };

    const operation = id === 'new'
      ? this.portfolioService.addProject(this.employeeId(), request)
      : this.portfolioService.updateProject(this.employeeId(), id, request);

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

  protected deleteProject(id: number): void {
    this.deletingId.set(id);
    this.portfolioService.deleteProject(this.employeeId(), id)
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
