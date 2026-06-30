import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { SkillsRegisterComponent } from './skills-register';
import { SkillsService } from '../skills.service';
import { SkillSearchResultResponse, SkillSummaryResponse } from '../skills.models';

const mockRegister: SkillSummaryResponse[] = [
  { id: 1, name: 'Angular', employeeCount: 2 },
  { id: 2, name: 'Java', employeeCount: 1 }
];

const mockSearchResults: SkillSearchResultResponse[] = [
  { employeeId: 1, employeeName: 'Jane Doe', years: 6, projectCount: 1 }
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

    fixture.componentInstance['searchControl'].setValue('Angular');
    fixture.detectChanges();

    expect(serviceSpy.searchBySkill).toHaveBeenCalledWith('Angular');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Jane Doe');
  });

  it('clears results when the default option is selected', () => {
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    fixture.componentInstance['searchControl'].setValue('Angular');
    fixture.detectChanges();

    fixture.componentInstance['searchControl'].setValue('');
    fixture.detectChanges();

    expect(fixture.componentInstance['searchResults']()).toBeNull();
  });

  it('shows "No employees found" when search returns empty list', () => {
    (serviceSpy.searchBySkill as ReturnType<typeof vi.fn>).mockReturnValue(of([]));
    const fixture = TestBed.createComponent(SkillsRegisterComponent);
    fixture.detectChanges();

    fixture.componentInstance['searchControl'].setValue('COBOL');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No employees found');
  });
});
