import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { catchError, EMPTY, of } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionService } from '../interaction.service';
import { InteractionFilter, InteractionResponse, InteractionType } from '../interaction.models';
import { InteractionFormModalComponent } from '../interaction-form-modal/interaction-form-modal';
import { avatarColor, initials } from '../../shared/avatar';
import { interactionTypeStyle } from '../../shared/interaction-type';

/**
 * Interactions timeline as an embeddable profile section (TSP-44). Reuses the Epic 2 logic
 * (filters by type/author/date, author-only edit/delete per D4) and drives the log/edit modal.
 */
@Component({
  selector: 'app-interactions-section',
  imports: [ReactiveFormsModule, InteractionFormModalComponent],
  templateUrl: './interactions-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionsSectionComponent {
  private readonly interactionService = inject(InteractionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly subjectId = input.required<number>();

  protected readonly avatarColor = avatarColor;
  protected readonly initials = initials;
  protected readonly typeStyle = interactionTypeStyle;

  protected readonly interactions = signal<InteractionResponse[]>([]);
  protected readonly authors = signal<EmployeeProfileResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly logOpen = signal(false);
  protected readonly editing = signal<InteractionResponse | null>(null);
  protected readonly filtersActive = signal(false);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly interactionTypes = Object.values(InteractionType);

  protected readonly filterForm = new FormGroup({
    type: new FormControl<InteractionType | null>(null),
    authorId: new FormControl<number | null>(null),
    date: new FormControl<string | null>(null)
  });

  protected readonly sortedInteractions = computed(() =>
    [...this.interactions()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  constructor() {
    if (this.currentUser() === null) {
      this.authService.loadCurrentUser()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: () => { /* best-effort */ } });
    }

    this.employeeService.getAll()
      .pipe(catchError(() => of([] as EmployeeProfileResponse[])), takeUntilDestroyed(this.destroyRef))
      .subscribe(employees => this.authors.set(employees));

    effect(() => {
      const id = this.subjectId();
      if (id > 0) {
        this.load(id);
      }
    });
  }

  private load(id: number, filter?: InteractionFilter): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.interactionService.findBySubject(id, filter)
      .pipe(
        catchError(() => {
          this.loading.set(false);
          this.errorMessage.set('Failed to load interactions.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(interactions => {
        this.interactions.set(interactions);
        this.loading.set(false);
      });
  }

  protected applyFilters(): void {
    const value = this.filterForm.value as InteractionFilter;
    this.filtersActive.set(!!(value.type || value.authorId || value.date));
    this.load(this.subjectId(), value);
  }

  protected resetFilters(): void {
    this.filterForm.reset({ type: null, authorId: null, date: null });
    this.filtersActive.set(false);
    this.load(this.subjectId());
  }

  protected isAuthor(interaction: InteractionResponse): boolean {
    const user = this.currentUser();
    return user !== null && interaction.author.id === user.id;
  }

  protected openLog(): void {
    this.editing.set(null);
    this.logOpen.set(true);
  }

  protected openEdit(interaction: InteractionResponse): void {
    this.editing.set(interaction);
    this.logOpen.set(true);
  }

  protected closeModal(): void {
    this.logOpen.set(false);
    this.editing.set(null);
  }

  protected onSaved(): void {
    this.closeModal();
    this.load(this.subjectId(), this.filterForm.value as InteractionFilter);
  }

  protected deleteInteraction(interaction: InteractionResponse): void {
    if (!this.isAuthor(interaction)) {
      return;
    }
    if (!confirm('Delete this interaction?')) {
      return;
    }
    this.deletingId.set(interaction.id);
    this.interactionService.delete(interaction.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deletingId.set(null);
          this.interactions.update(list => list.filter(i => i.id !== interaction.id));
        },
        error: () => {
          this.deletingId.set(null);
          this.errorMessage.set('Failed to delete interaction. Please try again.');
        }
      });
  }

  protected formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString();
  }
}
