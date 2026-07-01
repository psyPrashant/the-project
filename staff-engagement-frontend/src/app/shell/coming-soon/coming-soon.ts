import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Honest "under construction" placeholder (TSP-44) for screens and profile sections whose
 * backend does not exist yet (Dashboard, My Tasks, Skills Register). Renders no mocked data.
 *
 * `screen` is bound from route data (via component input binding) or directly as an input.
 * `bare` (default false) drops the full-page padding and uses an <h2> so the card can sit
 * inside a profile column; otherwise it is a full page with an <h1>.
 */
@Component({
  selector: 'app-coming-soon',
  imports: [NgTemplateOutlet],
  template: `
    @if (bare()) {
      <section
        class="flex flex-col items-center justify-center rounded-card border border-dashed border-[#dfe2e7] bg-card px-8 py-12 text-center"
      >
        <ng-container [ngTemplateOutlet]="body" [ngTemplateOutletContext]="{ heading: 'h2' }" />
      </section>
    } @else {
      <div class="mx-auto max-w-[1080px] px-10 py-8 pb-16">
        <section
          class="flex flex-col items-center justify-center rounded-card border border-dashed border-[#dfe2e7] bg-card px-8 py-16 text-center shadow-card"
        >
          <ng-container [ngTemplateOutlet]="body" [ngTemplateOutletContext]="{ heading: 'h1' }" />
        </section>
      </div>
    }

    <ng-template #body let-heading="heading">
      <div
        class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand"
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
        </svg>
      </div>
      @if (heading === 'h1') {
        <h1 class="m-0 text-xl font-bold tracking-tight text-ink">{{ screen() }}</h1>
      } @else {
        <h2 class="m-0 text-base font-bold tracking-tight text-ink">{{ screen() }}</h2>
      }
      <p class="mt-2 max-w-sm text-sm text-ink-soft">
        {{ screen() }} is under construction and will light up once its backend lands.
      </p>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComingSoonComponent {
  readonly screen = input.required<string>();
  readonly bare = input(false);
}
