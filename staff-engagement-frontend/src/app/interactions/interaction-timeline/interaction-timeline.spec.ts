import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { InteractionTimelineComponent } from './interaction-timeline';
import { InteractionService } from '../interaction.service';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionResponse, InteractionType } from '../interaction.models';

const mockEmployee: EmployeeProfileResponse = {
  id: 2,
  firstName: 'Bob',
  lastName: 'Jones',
  email: 'bob@example.com',
  jobTitle: null,
  department: null,
  phone: null,
  archived: false
};

const mockInteractions: InteractionResponse[] = [
  {
    id: 1,
    author: { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' },
    subject: { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones' },
    note: 'Older note',
    type: InteractionType.NOTE,
    date: '2026-06-20'
  },
  {
    id: 2,
    author: { id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' },
    subject: { id: 2, email: 'bob@example.com', firstName: 'Bob', lastName: 'Jones' },
    note: 'Newer note',
    type: InteractionType.CALL,
    date: '2026-06-25'
  }
];

function createActivatedRouteStub(params: Record<string, string>): Partial<ActivatedRoute> {
  return {
    snapshot: {
      paramMap: {
        get: (key: string) => params[key] ?? null,
        has: (key: string) => key in params,
        getAll: () => [],
        keys: Object.keys(params)
      }
    } as unknown as ActivatedRoute['snapshot']
  };
}

type TimelineInstance = {
  sortedInteractions(): InteractionResponse[];
  logInteraction(): void;
};

describe('InteractionTimelineComponent', () => {
  let interactionServiceSpy: Partial<InteractionService>;
  let employeeServiceSpy: Partial<EmployeeService>;

  beforeEach(() => {
    interactionServiceSpy = {
      findBySubject: vi.fn().mockReturnValue(of(mockInteractions))
    };
    employeeServiceSpy = {
      getProfile: vi.fn().mockReturnValue(of(mockEmployee))
    };
  });

  function configureTestBed(routeParams: Record<string, string> = { id: '2' }) {
    TestBed.configureTestingModule({
      imports: [InteractionTimelineComponent],
      providers: [
        provideRouter([]),
        { provide: InteractionService, useValue: interactionServiceSpy },
        { provide: EmployeeService, useValue: employeeServiceSpy },
        { provide: ActivatedRoute, useValue: createActivatedRouteStub(routeParams) }
      ]
    });
  }

  it('loads employee and interactions on init', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    expect(employeeServiceSpy.getProfile).toHaveBeenCalledWith(2);
    expect(interactionServiceSpy.findBySubject).toHaveBeenCalledWith(2);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Interactions with Bob Jones');
    expect(text).toContain('Older note');
    expect(text).toContain('Newer note');
  });

  it('sorts interactions by date descending', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    const sorted = c.sortedInteractions();
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(1);
  });

  it('shows empty state when no interactions', () => {
    (interactionServiceSpy.findBySubject as ReturnType<typeof vi.fn>).mockReturnValue(of([]));
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No interactions recorded yet');
  });

  it('navigates to log form with subjectId query param', async () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    c.logInteraction();

    expect(navigateSpy).toHaveBeenCalledWith(['/interactions/new'], { queryParams: { subjectId: 2 } });
  });

  it('displays error when interaction load fails', () => {
    (interactionServiceSpy.findBySubject as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('Load failed')));
    (employeeServiceSpy.getProfile as ReturnType<typeof vi.fn>).mockReturnValue(of(mockEmployee));
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Failed to load interactions');
  });
});
