import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, forkJoin } from 'rxjs';

import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionService } from '../interaction.service';
import { InteractionResponse } from '../interaction.models';

@Component({
  selector: 'app-interaction-timeline',
  imports: [RouterLink],
  templateUrl: './interaction-timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionTimelineComponent {
  private readonly interactionService = inject(InteractionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly subjectId = signal(Number(this.route.snapshot.paramMap.get('id')));
  protected readonly employee = signal<EmployeeProfileResponse | null>(null);
  protected readonly interactions = signal<InteractionResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

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

    forkJoin({
      employee: this.employeeService.getProfile(id),
      interactions: this.interactionService.findBySubject(id)
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

  protected logInteraction(): void {
    void this.router.navigate(['/interactions/new'], { queryParams: { subjectId: this.subjectId() } });
  }

  protected formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString();
  }
}
