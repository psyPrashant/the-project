import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { EducationSectionComponent } from './education-section';
import { PortfolioService } from '../portfolio.service';
import { EducationResponse } from '../portfolio.models';

const mockEducation: EducationResponse = {
  id: 1, employeeId: 1, institution: 'Uni', qualification: 'BSc', fieldOfStudy: 'CS', startYear: 2016, endYear: 2020, description: null
};

describe('EducationSectionComponent', () => {
  let serviceSpy: Partial<PortfolioService>;

  beforeEach(() => {
    serviceSpy = {
      addEducation: vi.fn().mockReturnValue(of(mockEducation)),
      updateEducation: vi.fn().mockReturnValue(of(mockEducation)),
      deleteEducation: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.configureTestingModule({
      imports: [EducationSectionComponent],
      providers: [{ provide: PortfolioService, useValue: serviceSpy }]
    });
  });

  it('renders education entries', () => {
    const fixture = TestBed.createComponent(EducationSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('education', [mockEducation]);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('BSc');
    expect(text).toContain('Uni');
  });

  it('emits changed when adding education', () => {
    const fixture = TestBed.createComponent(EducationSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('education', []);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      startNew: () => void;
      form: { patchValue: (v: Record<string, unknown>) => void };
      save: () => void;
    };
    c.startNew();
    c.form.patchValue({ institution: 'Uni', qualification: 'BSc' });
    c.save();

    expect(serviceSpy.addEducation).toHaveBeenCalled();
    expect(changedSpy).toHaveBeenCalled();
  });

  it('does not call service when the form is invalid', () => {
    const fixture = TestBed.createComponent(EducationSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('education', []);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      startNew: () => void;
      save: () => void;
    };
    c.startNew();
    c.save();

    expect(serviceSpy.addEducation).not.toHaveBeenCalled();
  });

  it('emits changed when deleting education', () => {
    const fixture = TestBed.createComponent(EducationSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('education', [mockEducation]);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteEducation: (id: number) => void };
    c.deleteEducation(1);

    expect(serviceSpy.deleteEducation).toHaveBeenCalledWith(1, 1);
    expect(changedSpy).toHaveBeenCalled();
  });

  it('resets deletingId when delete fails', () => {
    (serviceSpy.deleteEducation as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(EducationSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('education', [mockEducation]);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteEducation: (id: number) => void; deletingId: () => number | null };
    c.deleteEducation(1);

    expect(c.deletingId()).toBeNull();
  });
});
