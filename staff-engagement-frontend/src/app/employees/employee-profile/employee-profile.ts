import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';
import { EmployeeFormModalComponent } from '../employee-form-modal/employee-form-modal';
import { PortfolioService } from '../../portfolios/portfolio.service';
import { PortfolioResponse } from '../../portfolios/portfolio.models';
import { EducationSectionComponent } from '../../portfolios/education-section/education-section';
import { ProjectSectionComponent } from '../../portfolios/project-section/project-section';
import { LinkSectionComponent } from '../../portfolios/link-section/link-section';
import { SkillSectionComponent } from '../../portfolios/skill-section/skill-section';
import { InteractionsSectionComponent } from '../../interactions/interactions-section/interactions-section';
import { TasksSectionComponent } from '../../tasks/tasks-section/tasks-section';
import { avatarColor, initials } from '../../shared/avatar';

/**
 * Consolidated employee profile (TSP-44): header + actions, interactions, portfolio (projects /
 * education / links) and coming-soon Tasks & Skills sections, all on one page. Folds in the old
 * interactions-timeline and portfolio routes; create/edit happen in modals.
 */
@Component({
  selector: 'app-employee-profile',
  imports: [
    RouterLink,
    EmployeeFormModalComponent,
    InteractionsSectionComponent,
    TasksSectionComponent,
    SkillSectionComponent,
    EducationSectionComponent,
    ProjectSectionComponent,
    LinkSectionComponent
  ],
  templateUrl: './employee-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeProfileComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly portfolioService = inject(PortfolioService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly avatarColor = avatarColor;
  protected readonly initials = initials;

  protected readonly employeeId = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly employee = signal<EmployeeProfileResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly archiving = signal(false);
  protected readonly unarchiving = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly editOpen = signal(false);

  protected readonly portfolio = signal<PortfolioResponse | null>(null);

  constructor() {
    if (!this.employeeId || isNaN(this.employeeId)) {
      this.loadError.set('Employee not found.');
      this.loading.set(false);
      return;
    }

    this.employeeService.getProfile(this.employeeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: emp => {
          this.employee.set(emp);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Failed to load employee.');
          this.loading.set(false);
        }
      });

    this.reloadPortfolio();
  }

  protected reloadPortfolio(): void {
    this.portfolioService.getPortfolio(this.employeeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: portfolio => this.portfolio.set(portfolio),
        error: () => { /* portfolio is best-effort on the profile */ }
      });
  }

  protected archive(): void {
    const emp = this.employee();
    if (!emp || this.archiving()) {
      return;
    }
    this.archiving.set(true);
    this.employeeService.archive(emp.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.employee.set({ ...emp, archived: true });
          this.archiving.set(false);
        },
        error: () => this.archiving.set(false)
      });
  }

  protected unarchive(): void {
    const emp = this.employee();
    if (!emp || this.unarchiving()) {
      return;
    }
    this.unarchiving.set(true);
    this.employeeService.unarchive(emp.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: updated => {
          this.employee.set(updated);
          this.unarchiving.set(false);
        },
        error: () => {
          this.unarchiving.set(false);
          this.actionError.set('Failed to unarchive employee. Please try again.');
        }
      });
  }

  protected openEdit(): void {
    this.editOpen.set(true);
  }

  protected closeEdit(): void {
    this.editOpen.set(false);
  }

  protected onEmployeeSaved(emp: EmployeeProfileResponse): void {
    this.employee.set(emp);
    this.editOpen.set(false);
  }
}
