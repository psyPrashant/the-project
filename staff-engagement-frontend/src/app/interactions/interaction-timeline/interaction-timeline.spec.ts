import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { InteractionTimelineComponent } from './interaction-timeline';
import { InteractionService } from '../interaction.service';
import { EmployeeService } from '../../employees/employee.service';
import { AuthService } from '../../auth/auth.service';
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
  editInteraction(interaction: InteractionResponse): void;
  deleteInteraction(interaction: InteractionResponse): void;
  applyFilters(): void;
  resetFilters(): void;
  filterForm: { value: { type: InteractionType | null; authorId: number | null; date: string | null } };
};

describe('InteractionTimelineComponent', () => {
  let interactionServiceSpy: Partial<InteractionService>;
  let employeeServiceSpy: Partial<EmployeeService>;
  let currentUserSignal: ReturnType<typeof signal>;

  beforeEach(() => {
    interactionServiceSpy = {
      findBySubject: vi.fn().mockReturnValue(of(mockInteractions)),
      delete: vi.fn().mockReturnValue(of(undefined))
    };
    employeeServiceSpy = {
      getProfile: vi.fn().mockReturnValue(of(mockEmployee)),
      getAll: vi.fn().mockReturnValue(of([]))
    };
    currentUserSignal = signal({ id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function configureTestBed(routeParams: Record<string, string> = { id: '2' }) {
    TestBed.configureTestingModule({
      imports: [InteractionTimelineComponent],
      providers: [
        provideRouter([]),
        { provide: InteractionService, useValue: interactionServiceSpy },
        { provide: EmployeeService, useValue: employeeServiceSpy },
        {
          provide: AuthService,
          useValue: {
            currentUser: currentUserSignal.asReadonly(),
            loadCurrentUser: vi.fn().mockReturnValue(of({ id: 1, email: 'alice@example.com', firstName: 'Alice', lastName: 'Smith' }))
          }
        },
        { provide: ActivatedRoute, useValue: createActivatedRouteStub(routeParams) }
      ]
    });
  }

  it('loads employee and interactions on init', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    expect(employeeServiceSpy.getProfile).toHaveBeenCalledWith(2);
    expect(interactionServiceSpy.findBySubject).toHaveBeenLastCalledWith(2, undefined);

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

  it('shows edit and delete buttons for own interactions', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('li');
    expect(items.length).toBe(2);
    items.forEach(item => {
      expect(item.textContent).toContain('Edit');
      expect(item.textContent).toContain('Delete');
    });
  });

  it('hides edit and delete buttons for interactions by other authors', () => {
    currentUserSignal.set({ id: 99, email: 'other@example.com', firstName: 'Other', lastName: 'User' });
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('li');
    items.forEach(item => {
      expect(item.textContent).not.toContain('Edit');
      expect(item.textContent).not.toContain('Delete');
    });
  });

  it('navigates to edit route when edit is clicked', async () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    c.editInteraction(mockInteractions[0]);

    expect(navigateSpy).toHaveBeenCalledWith(['/interactions', 1, 'edit']);
  });

  it('calls delete service and removes interaction from list when delete is confirmed', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    c.deleteInteraction(mockInteractions[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this interaction?');
    expect(interactionServiceSpy.delete).toHaveBeenCalledWith(1);
    fixture.detectChanges();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Newer note');
  });

  it('does not delete when confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    c.deleteInteraction(mockInteractions[0]);

    expect(interactionServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('blocks delete for non-author even if called programmatically', () => {
    currentUserSignal.set({ id: 99, email: 'other@example.com', firstName: 'Other', lastName: 'User' });
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    c.deleteInteraction(mockInteractions[0]);

    expect(interactionServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('loads employees for the author filter on init', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    expect(employeeServiceSpy.getAll).toHaveBeenCalled();
  });

  it('applyFilters() calls service with selected filters', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    c.filterForm.value.type = InteractionType.CALL;
    c.filterForm.value.authorId = 1;
    c.filterForm.value.date = '2026-06-25';
    c.applyFilters();

    expect(interactionServiceSpy.findBySubject).toHaveBeenCalledWith(2, {
      type: InteractionType.CALL,
      authorId: 1,
      date: '2026-06-25'
    });
  });

  it('resetFilters() clears filters and reloads full timeline', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    const c = fixture.componentInstance as unknown as TimelineInstance;
    fixture.detectChanges();

    c.filterForm.value.type = InteractionType.CALL;
    c.resetFilters();

    expect(interactionServiceSpy.findBySubject).toHaveBeenLastCalledWith(2, undefined);
  });

  it('renders filter controls', () => {
    configureTestBed();
    const fixture = TestBed.createComponent(InteractionTimelineComponent);
    fixture.detectChanges();

    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(form).not.toBeNull();
    expect(form?.querySelector('#filter-type')).not.toBeNull();
    expect(form?.querySelector('#filter-author')).not.toBeNull();
    expect(form?.querySelector('#filter-date')).not.toBeNull();
  });
});
