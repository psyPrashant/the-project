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
import { ShowcaseLinkResponse } from '../portfolio.models';

@Component({
  selector: 'app-link-section',
  imports: [ReactiveFormsModule],
  templateUrl: './link-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkSectionComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly employeeId = input.required<number>();
  readonly links = input.required<ShowcaseLinkResponse[]>();
  readonly changed = output<void>();

  protected readonly editingId = signal<number | 'new' | null>(null);
  protected readonly submitting = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = new FormGroup({
    label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    url: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sortOrder: new FormControl<number | null>(null)
  });

  protected startNew(): void {
    this.form.reset();
    this.saveError.set(null);
    this.editingId.set('new');
  }

  protected startEdit(link: ShowcaseLinkResponse): void {
    this.form.patchValue({
      label: link.label,
      url: link.url,
      sortOrder: link.sortOrder
    });
    this.saveError.set(null);
    this.editingId.set(link.id);
  }

  protected cancel(): void {
    this.editingId.set(null);
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

    const id = this.editingId();
    if (id === null) return;

    const { label, url, sortOrder } = this.form.getRawValue();
    const request = { label, url, sortOrder };

    const operation = id === 'new'
      ? this.portfolioService.addLink(this.employeeId(), request)
      : this.portfolioService.updateLink(this.employeeId(), id, request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting.set(false);
        this.editingId.set(null);
        this.form.reset();
        this.changed.emit();
      },
      error: (err) => {
        this.submitting.set(false);
        this.saveError.set(err?.error?.message ?? 'Failed to save link.');
      }
    });
  }

  protected deleteLink(id: number): void {
    this.deletingId.set(id);
    this.portfolioService.deleteLink(this.employeeId(), id)
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
