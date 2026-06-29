import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { LinkSectionComponent } from './link-section';
import { PortfolioService } from '../portfolio.service';
import { ShowcaseLinkResponse } from '../portfolio.models';

const mockLink: ShowcaseLinkResponse = {
  id: 3, employeeId: 1, label: 'GitHub', url: 'https://github.com', sortOrder: 1
};

describe('LinkSectionComponent', () => {
  let serviceSpy: Partial<PortfolioService>;

  beforeEach(() => {
    serviceSpy = {
      addLink: vi.fn().mockReturnValue(of(mockLink)),
      updateLink: vi.fn().mockReturnValue(of(mockLink)),
      deleteLink: vi.fn().mockReturnValue(of(undefined))
    };

    TestBed.configureTestingModule({
      imports: [LinkSectionComponent],
      providers: [{ provide: PortfolioService, useValue: serviceSpy }]
    });
  });

  it('renders showcase links', () => {
    const fixture = TestBed.createComponent(LinkSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('links', [mockLink]);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('GitHub');
  });

  it('emits changed when adding a link', () => {
    const fixture = TestBed.createComponent(LinkSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('links', []);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      startNew: () => void;
      form: { patchValue: (v: Record<string, unknown>) => void };
      save: () => void;
    };
    c.startNew();
    c.form.patchValue({ label: 'GitHub', url: 'https://github.com' });
    c.save();

    expect(serviceSpy.addLink).toHaveBeenCalled();
    expect(changedSpy).toHaveBeenCalled();
  });

  it('does not call service when the form is invalid', () => {
    const fixture = TestBed.createComponent(LinkSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('links', []);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as {
      startNew: () => void;
      save: () => void;
    };
    c.startNew();
    c.save();

    expect(serviceSpy.addLink).not.toHaveBeenCalled();
  });

  it('emits changed when deleting a link', () => {
    const fixture = TestBed.createComponent(LinkSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('links', [mockLink]);
    const changedSpy = vi.fn();
    fixture.componentInstance.changed.subscribe(changedSpy);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteLink: (id: number) => void };
    c.deleteLink(3);

    expect(serviceSpy.deleteLink).toHaveBeenCalledWith(1, 3);
    expect(changedSpy).toHaveBeenCalled();
  });

  it('resets deletingId when delete fails', () => {
    (serviceSpy.deleteLink as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(LinkSectionComponent);
    fixture.componentRef.setInput('employeeId', 1);
    fixture.componentRef.setInput('links', [mockLink]);
    fixture.detectChanges();

    const c = fixture.componentInstance as unknown as { deleteLink: (id: number) => void; deletingId: () => number | null };
    c.deleteLink(3);

    expect(c.deletingId()).toBeNull();
  });
});
