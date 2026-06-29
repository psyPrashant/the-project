import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { PortfolioComponent } from './portfolio';
import { PortfolioService } from '../portfolio.service';
import { PortfolioResponse } from '../portfolio.models';
import { EducationSectionComponent } from '../education-section/education-section';
import { ProjectSectionComponent } from '../project-section/project-section';
import { LinkSectionComponent } from '../link-section/link-section';

const mockPortfolio: PortfolioResponse = {
  employeeId: 1,
  education: [{ id: 1, employeeId: 1, institution: 'Uni', qualification: 'BSc', fieldOfStudy: null, startYear: null, endYear: null, description: null }],
  projects: [{ id: 2, employeeId: 1, name: 'Project', description: null, startDate: null, endDate: null, url: null }],
  links: [{ id: 3, employeeId: 1, label: 'GitHub', url: 'https://github.com', sortOrder: null }]
};

describe('PortfolioComponent', () => {
  let serviceSpy: Partial<PortfolioService>;
  let paramMapSubject: BehaviorSubject<{ get: (key: string) => string | null }>;

  beforeEach(() => {
    paramMapSubject = new BehaviorSubject<{ get: (key: string) => string | null }>({ get: () => '1' });
    serviceSpy = {
      getPortfolio: vi.fn().mockReturnValue(of(mockPortfolio))
    };

    TestBed.configureTestingModule({
      imports: [PortfolioComponent, EducationSectionComponent, ProjectSectionComponent, LinkSectionComponent],
      providers: [
        provideRouter([]),
        { provide: PortfolioService, useValue: serviceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable()
          }
        }
      ]
    });
  });

  it('renders the portfolio sections when data loads', () => {
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Education');
    expect(text).toContain('Projects');
    expect(text).toContain('Showcase Links');
  });

  it('loads portfolio for the route id', () => {
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();
    expect(serviceSpy.getPortfolio).toHaveBeenCalledWith(1);
  });

  it('reloads portfolio when route parameter changes', () => {
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();

    paramMapSubject.next({ get: (key: string) => key === 'id' ? '2' : null });
    fixture.detectChanges();

    expect(serviceSpy.getPortfolio).toHaveBeenCalledWith(2);
  });

  it('shows an error message for an invalid route id', () => {
    paramMapSubject.next({ get: () => 'invalid' });
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Invalid employee ID');
    expect(serviceSpy.getPortfolio).not.toHaveBeenCalled();
  });

  it('shows an error message when loading fails', () => {
    (serviceSpy.getPortfolio as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Failed to load portfolio');
  });

  it('navigates back to employee profile', () => {
    const fixture = TestBed.createComponent(PortfolioComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    (fixture.componentInstance as unknown as { navigateToEmployee: () => void }).navigateToEmployee();

    expect(navigateSpy).toHaveBeenCalledWith(['/employees', 1]);
  });
});
