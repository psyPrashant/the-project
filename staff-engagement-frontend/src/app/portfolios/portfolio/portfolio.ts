import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';

import { PortfolioService } from '../portfolio.service';
import { PortfolioResponse } from '../portfolio.models';
import { EducationSectionComponent } from '../education-section/education-section';
import { ProjectSectionComponent } from '../project-section/project-section';
import { LinkSectionComponent } from '../link-section/link-section';
import { SkillSectionComponent } from '../skill-section/skill-section';
import { SkillsService } from '../../skills/skills.service';
import { EmployeeSkillResponse } from '../../skills/skills.models';

@Component({
  selector: 'app-portfolio',
  imports: [EducationSectionComponent, ProjectSectionComponent, LinkSectionComponent, SkillSectionComponent, RouterLink],
  templateUrl: './portfolio.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly skillsService = inject(SkillsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly employeeId = toSignal(
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      filter(id => !Number.isNaN(id) && id > 0)
    ),
    { initialValue: 0 }
  );
  protected readonly portfolio = signal<PortfolioResponse | null>(null);
  protected readonly skills = signal<EmployeeSkillResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.employeeId();
      if (id > 0) {
        this.loadPortfolio(id);
        this.loadSkills(id);
      } else {
        this.loading.set(false);
        this.errorMessage.set('Invalid employee ID.');
      }
    });
  }

  protected loadPortfolio(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.portfolioService.getPortfolio(id)
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

  protected loadSkills(id: number): void {
    this.skillsService.getEmployeeSkills(id).subscribe({
      next: skills => this.skills.set(skills),
      error: () => this.skills.set([])
    });
  }

  protected navigateToEmployee(): void {
    void this.router.navigate(['/employees', this.employeeId()]);
  }
}
