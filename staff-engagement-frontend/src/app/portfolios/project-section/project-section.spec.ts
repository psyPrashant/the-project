import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProjectSectionComponent } from './project-section';
import { PortfolioService } from '../portfolio.service';
import { ProjectResponse } from '../portfolio.models';

const mockProject: ProjectResponse = {
  id: 2, employeeId: 1, name: 'Project', description: null, startDate: null, endDate: null, url: null
};

describe('ProjectSectionComponent', () => {
  let serviceSpy: Partial<PortfolioService>;

  beforeEach(() => {
    serviceSpy = {
      addProject: vi.fn().mockReturnValue(of(mockProject)),
      updateProject: vi.fn().mockReturnValue(of(mockProject)),
      deleteProject: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.configureTestingModule({
      imports: [ProjectSectionComponent],
      providers: [{ provide: PortfolioService, useValue: serviceSpy }]
    });
  });

  it('renders project entries', () => {
    const fixture = TestBed.createComponent(ProjectSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('projects', [mockProject]);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Project');
  });

  it('emits changed when adding a project', () => {
    const fixture = TestBed.createComponent(ProjectSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('projects', []);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      startNew: () => void;
      form: { patchValue: (v: Record<string, unknown>) => void };
      save: () => void;
    };
    c.startNew();
    c.form.patchValue({ name: 'Project' });
    c.save();

    expect(serviceSpy.addProject).toHaveBeenCalled();
    expect(changedSpy).toHaveBeenCalled();
  });

  it('does not call service when the form is invalid', () => {
    const fixture = TestBed.createComponent(ProjectSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('projects', []);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      startNew: () => void;
      save: () => void;
    };
    c.startNew();
    c.save();

    expect(serviceSpy.addProject).not.toHaveBeenCalled();
  });

  it('emits changed when deleting a project', () => {
    const fixture = TestBed.createComponent(ProjectSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('projects', [mockProject]);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteProject: (id: number) => void };
    c.deleteProject(2);

    expect(serviceSpy.deleteProject).toHaveBeenCalledWith(1, 2);
    expect(changedSpy).toHaveBeenCalled();
  });

  it('resets deletingId when delete fails', () => {
    (serviceSpy.deleteProject as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(ProjectSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('projects', [mockProject]);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteProject: (id: number) => void; deletingId: () => number | null };
    c.deleteProject(2);

    expect(c.deletingId()).toBeNull();
  });
});
