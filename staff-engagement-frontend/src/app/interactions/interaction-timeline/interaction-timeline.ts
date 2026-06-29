import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, forkJoin } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionService } from '../interaction.service';
import { InteractionFilter, InteractionResponse, InteractionType } from '../interaction.models';

@Component({
  selector: 'app-interaction-timeline',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './interaction-timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionTimelineComponent {
  private readonly interactionService = inject(InteractionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly subjectId = signal(Number(this.route.snapshot.paramMap.get('id')));
  protected readonly employee = signal<EmployeeProfileResponse | null>(null);
  protected readonly interactions = signal<InteractionResponse[]>([]);
  protected readonly employees = signal<EmployeeProfileResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly filterForm: FormGroup = this.formBuilder.group({
    type: [null as InteractionType | null],
    authorId: [null as number | null],
    date: [null as string | null]
  });

  protected readonly currentUser = this.authService.currentUser;
  protected readonly interactionTypes = Object.values(InteractionType);

  protected readonly sortedInteractions = computed(() => {
    return [...this.interactions()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  constructor() {
    const id = this.subjectId();
    if (Number.isNaN(id)) {
      this.loading.set(false);
      this.errorMessage.set('Invalid employee id.');
      return;
    }

    if (this.currentUser() === null) {
      this.authService.loadCurrentUser()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: () => { /* best-effort */ } });
    }

    this.employeeService.getAll()
      .pipe(
        catchError(() => {
          this.errorMessage.set('Failed to load employees for filter.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(employees => this.employees.set(employees));

    this.loadInteractions(id);
  }

  private loadInteractions(id: number, filter?: InteractionFilter): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      employee: this.employeeService.getProfile(id),
      interactions: this.interactionService.findBySubject(id, filter)
    })
      .pipe(
        catchError(() => {
          this.loading.set(false);
          this.errorMessage.set('Failed to load interactions.');
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(result => {
        this.employee.set(result.employee);
        this.interactions.set(result.interactions);
        this.loading.set(false);
      });
  }

  protected applyFilters(): void {
    const formValue = this.filterForm.value as InteractionFilter;
    this.loadInteractions(this.subjectId(), formValue);
  }

  protected resetFilters(): void {
    this.filterForm.reset({ type: null, authorId: null, date: null });
    this.loadInteractions(this.subjectId());
  }

  protected isAuthor(interaction: InteractionResponse): boolean {
    const user = this.currentUser();
    return user !== null && interaction.author.id === user.id;
  }

  protected logInteraction(): void {
    void this.router.navigate(['/interactions/new'], { queryParams: { subjectId: this.subjectId() } });
  }

  protected editInteraction(interaction: InteractionResponse): void {
    void this.router.navigate(['/interactions', interaction.id, 'edit']);
  }

  protected deleteInteraction(interaction: InteractionResponse): void {
    if (!this.isAuthor(interaction)) {
      return;
    }
    if (!confirm('Are you sure you want to delete this interaction?')) {
      return;
    }

    this.deletingId.set(interaction.id);
    this.errorMessage.set(null);

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
