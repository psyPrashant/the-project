import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';

import { SkillsRegisterComponent } from './skills-register';
import { SkillsService } from '../skills.service';
import { SkillSearchResultResponse, SkillSummaryResponse } from '../skills.models';

type ComponentInternals = {
  searchControl: FormControl<string>;
  searchResults: () => SkillSearchResultResponse[] | null;
  loading: () => boolean;
  searching: () => boolean;
  register: () => SkillSummaryResponse[];
};

const mockRegister: SkillSummaryResponse[] = [
  { id: 1, name: 'Angular', employeeCount: 2 },
  { id: 2, name: 'Java', employeeCount: 1 }
];

const mockSearchResults: SkillSearchResultResponse[] = [
  { employeeId: 1, employeeName: 'Jane Doe', skillName: 'Angular', years: 6, projectCount: 1 }
];

describe('SkillsRegisterComponent', () => {
  let serviceSpy: Partial<SkillsService>;

  beforeEach(() => {
    serviceSpy = {
      browseRegister: vi.fn().mockReturnValue(of(mockRegister)),
      searchBySkill: vi.fn().mockReturnValue(of(mockSearchResults))
    };

    TestBed.configureTestingModule({
      imports: [SkillsRegisterComponent],
      providers: [
        { provide: SkillsService, useValue: serviceSpy },
        provideRouter([])
      ]
    });
  });

  it('renders a dropdown with all canonical skills', () => {
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select') as HTMLSelectElement;
    expect(select).toBeTruthy();
    const options = Array.from(select.options).map(o => o.text);
    expect(options.some(t => t.includes('Angular'))).toBe(true);
    expect(options.some(t => t.includes('Java'))).toBe(true);
  });

  it('renders the full skill list in the browse section', () => {
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Angular');
    expect(text).toContain('Java');
  });

  it('calls searchBySkill when a skill is selected from the dropdown', () => {
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as ComponentInternals;
    comp.searchControl.setValue('Angular');
    fixture.detectChanges();

    expect(serviceSpy.searchBySkill).toHaveBeenCalledWith('Angular');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Jane Doe');
  });

  it('clears results when the default option is selected', () => {
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as ComponentInternals;
    comp.searchControl.setValue('Angular');
    fixture.detectChanges();

    comp.searchControl.setValue('');
    fixture.detectChanges();

    expect(comp.searchResults()).toBeNull();
  });

  it('shows a placeholder message when search returns empty list', () => {
    (serviceSpy.searchBySkill as ReturnType<typeof vi.fn>).mockReturnValue(of([]));
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as ComponentInternals;
    comp.searchControl.setValue('COBOL');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Nobody is recorded with this skill yet.');
  });

  it('shows loading state initially and clears it after register loads', () => {
    const subject = new Subject<SkillSummaryResponse[]>();
    (serviceSpy.browseRegister as ReturnType<typeof vi.fn>).mockReturnValue(subject.asObservable());

    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    const comp = fixture.componentInstance as unknown as ComponentInternals;

    expect(comp.loading()).toBe(true);
    expect(comp.searching()).toBe(false);
    expect(comp.register()).toEqual([]);
    expect(comp.searchControl.value).toBe('');

    subject.next(mockRegister);
    subject.complete();
    fixture.detectChanges();

    expect(comp.loading()).toBe(false);
    expect(comp.register()).toEqual(mockRegister);
  });

  it('sets loading to false when browseRegister errors', () => {
    (serviceSpy.browseRegister as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as ComponentInternals;
    expect(comp.loading()).toBe(false);
    expect(comp.register()).toEqual([]);
  });

  it('sets searching to true while search is in flight and false when it completes', () => {
    const searchSubject = new Subject<SkillSearchResultResponse[]>();
    (serviceSpy.searchBySkill as ReturnType<typeof vi.fn>).mockReturnValue(searchSubject.asObservable());

    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as ComponentInternals;
    comp.searchControl.setValue('Angular');
    fixture.detectChanges();

    expect(comp.searching()).toBe(true);

    searchSubject.next(mockSearchResults);
    searchSubject.complete();
    fixture.detectChanges();

    expect(comp.searching()).toBe(false);
    expect(comp.searchResults()).toEqual(mockSearchResults);
  });

  it('sets searching to false when searchBySkill errors', () => {
    (serviceSpy.searchBySkill as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as ComponentInternals;
    comp.searchControl.setValue('Angular');
    fixture.detectChanges();

    expect(comp.searching()).toBe(false);
  });

  it('does not update searchResults when searchBySkill emits null', () => {
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    const comp = fixture.componentInstance as unknown as ComponentInternals;
    comp.searchControl.setValue('Angular');
    fixture.detectChanges();
    expect(comp.searchResults()).toEqual(mockSearchResults);

    (serviceSpy.searchBySkill as ReturnType<typeof vi.fn>)
      .mockReturnValue(of(null as unknown as SkillSearchResultResponse[]));
    comp.searchControl.setValue('React');
    fixture.detectChanges();

    expect(comp.searchResults()).toEqual(mockSearchResults);
  });
});
