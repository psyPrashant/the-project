import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';

import { ModalComponent } from './modal';

@Component({
  imports: [ModalComponent],
  template: `
    <app-modal
      [heading]="heading"
      [open]="open()"
      saveLabel="Save interaction"
      (save)="saved = saved + 1"
      (cancel)="cancelled = cancelled + 1"
    >
      <p>Body content</p>
    </app-modal>
  `
})
class HostComponent {
  heading = 'Log interaction';
  open = signal(false);
  saved = 0;
  cancelled = 0;
}

describe('ModalComponent', () => {
  it('renders heading, projected body and the save label', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Log interaction');
    expect(text).toContain('Body content');
    expect(text).toContain('Save interaction');
  });

  it('emits save and cancel from the footer buttons', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    (host.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();
    expect(fixture.componentInstance.cancelled).toBe(1);

    const footerButtons = host.querySelectorAll('footer button');
    (footerButtons[0] as HTMLButtonElement).click(); // Cancel
    (footerButtons[1] as HTMLButtonElement).click(); // Save
    expect(fixture.componentInstance.cancelled).toBe(2);
    expect(fixture.componentInstance.saved).toBe(1);
  });
});
