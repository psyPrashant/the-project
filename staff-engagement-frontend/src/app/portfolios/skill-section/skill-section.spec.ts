import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { SkillSectionComponent } from './skill-section';
import { SkillsService } from '../../skills/skills.service';
import { EmployeeSkillResponse } from '../../skills/skills.models';

const mockSkill: EmployeeSkillResponse = {
  id: 10, skillId: 1, skillName: 'Angular', years: 4, projectCount: 2
};

describe('SkillSectionComponent', () => {
  let serviceSpy: Partial<SkillsService>;

  beforeEach(() => {
    serviceSpy = {
      addSkill: vi.fn().mockReturnValue(of(mockSkill)),
      deleteSkill: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.configureTestingModule({
      imports: [SkillSectionComponent],
      providers: [{ provide: SkillsService, useValue: serviceSpy }]
    });
  });

  it('renders skill entries', () => {
    const fixture = TestBed.createComponent(SkillSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('skills', [mockSkill]);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Angular');
  });

  it('shows empty state when no skills', () => {
    const fixture = TestBed.createComponent(SkillSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('skills', []);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No skills recorded yet');
  });

  it('emits changed when adding a skill', () => {
    const fixture = TestBed.createComponent(SkillSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('skills', []);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      startAdd: () => void;
      form: { patchValue: (v: Record<string, unknown>) => void };
      save: () => void;
    };
    c.startAdd();
    c.form.patchValue({ skillName: 'Angular', years: 4 });
    c.save();

    expect(serviceSpy.addSkill).toHaveBeenCalledWith(1, { skillName: 'Angular', years: 4 });
    expect(changedSpy).toHaveBeenCalled();
  });

  it('does not call service when the form is invalid', () => {
    const fixture = TestBed.createComponent(SkillSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('skills', []);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { startAdd: () => void; save: () => void };
    c.startAdd();
    c.save();

    expect(serviceSpy.addSkill).not.toHaveBeenCalled();
  });

  it('emits changed when deleting a skill', () => {
    const fixture = TestBed.createComponent(SkillSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('skills', [mockSkill]);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteSkill: (id: number) => void };
    c.deleteSkill(10);

    expect(serviceSpy.deleteSkill).toHaveBeenCalledWith(1, 10);
    expect(changedSpy).toHaveBeenCalled();
  });

  it('resets deletingId when delete fails', () => {
    (serviceSpy.deleteSkill as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(SkillSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('skills', [mockSkill]);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteSkill: (id: number) => void; deletingId: () => number | null };
    c.deleteSkill(10);

    expect(c.deletingId()).toBeNull();
  });
});
