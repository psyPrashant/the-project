import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  viewChild
} from '@angular/core';

/**
 * Reusable modal (TSP-44) built on the native <dialog> element for free focus-trapping, Escape
 * handling and a backdrop. The parent owns the `open` state: Cancel / close / Escape / backdrop
 * emit `cancel`, and `save` is emitted for the parent to validate before it closes the modal.
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  readonly heading = input.required<string>();
  readonly open = input(false);
  readonly saveLabel = input('Save');
  readonly cancelLabel = input('Cancel');
  readonly saving = input(false);

  readonly save = output<void>();
  readonly cancel = output<void>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dlg');
  private readonly injector = inject(Injector);

  private static nextId = 0;
  protected readonly headingId = `modal-heading-${++ModalComponent.nextId}`;

  constructor() {
    // Register the open/close effect after the first render so viewChild is guaranteed to
    // be resolved before the effect reads it — avoids a silent no-op on the very first open.
    afterNextRender(() => {
      effect(
        () => {
          const el = this.dialog()?.nativeElement;
          if (!el || typeof el.showModal !== 'function') return;
          if (this.open() && !el.open) {
            el.showModal();
          } else if (!this.open() && el.open) {
            el.close();
          }
        },
        { injector: this.injector }
      );
    });
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) {
      this.cancel.emit();
    }
  }

  protected onDialogCancel(event: Event): void {
    // Escape: keep the parent's `open` the single source of truth instead of letting the
    // dialog close itself out of sync.
    event.preventDefault();
    this.cancel.emit();
  }
}
