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

import { InteractionService } from '../interaction.service';
import { InteractionResponse, InteractionType } from '../interaction.models';
import { interactionTypeStyle } from '../../shared/interaction-type';
import { ModalComponent } from '../../shell/modal/modal';

/**
 * Log or edit an interaction in a modal (TSP-44), replacing the old form route. The parent owns
 * `open` and provides the `subjectId`; passing an `interaction` switches the modal to edit mode.
 */
@Component({
  selector: 'app-interaction-form-modal',
  imports: [ReactiveFormsModule, ModalComponent],
  templateUrl: './interaction-form-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionFormModalComponent {
  private readonly interactionService = inject(InteractionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly open = input(false);
  readonly subjectId = input.required<number>();
  readonly interaction = input<InteractionResponse | null>(null);

  readonly saved = output<InteractionResponse>();
  readonly closed = output<void>();

  protected readonly types = Object.values(InteractionType);
  protected readonly typeLabel = (type: InteractionType) => interactionTypeStyle(type).label;

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEdit = computed(() => this.interaction() !== null);

  protected readonly form = new FormGroup({
    type: new FormControl(InteractionType.NOTE, { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(this.today(), { nonNullable: true, validators: [Validators.required] }),
    note: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        return;
      }
      const existing = this.interaction();
      this.errorMessage.set(null);
      this.submitting.set(false);
      this.form.reset({
        type: existing?.type ?? InteractionType.NOTE,
        date: existing?.date ?? this.today(),
        note: existing?.note ?? ''
      });
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);

    const { type, date, note } = this.form.getRawValue();
    const request = { subjectId: this.subjectId(), type, date, note: note.trim() };

    const existing = this.interaction();
    const operation = existing
      ? this.interactionService.update(existing.id, request)
      : this.interactionService.create(request);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: saved => {
        this.submitting.set(false);
        this.saved.emit(saved);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Failed to save interaction. Please try again.');
      }
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
