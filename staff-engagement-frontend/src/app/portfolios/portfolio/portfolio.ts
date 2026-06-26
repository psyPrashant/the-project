import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { PortfolioService } from '../portfolio.service';
import { PortfolioResponse } from '../portfolio.models';
import { EducationSectionComponent } from '../education-section/education-section';
import { ProjectSectionComponent } from '../project-section/project-section';
import { LinkSectionComponent } from '../link-section/link-section';

@Component({
  selector: 'app-portfolio',
  imports: [EducationSectionComponent, ProjectSectionComponent, LinkSectionComponent],
  templateUrl: './portfolio.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly employeeId = signal<number>(
    Number(this.route.snapshot.paramMap.get('id'))
  );
  protected readonly portfolio = signal<PortfolioResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.loadPortfolio();
  }

  protected loadPortfolio(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.portfolioService.getPortfolio(this.employeeId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: portfolio => {
          this.portfolio.set(portfolio);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Failed to load portfolio.');
        }
      });
  }

  protected navigateToEmployee(): void {
    void this.router.navigate(['/employees', this.employeeId()]);
  }
}
