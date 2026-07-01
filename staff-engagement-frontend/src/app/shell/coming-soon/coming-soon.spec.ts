import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';

import { ComingSoonComponent } from './coming-soon';

@Component({
  imports: [ComingSoonComponent],
  template: `<app-coming-soon [screen]="screen" [bare]="bare" />`
})
class HostComponent {
  screen = 'My Dashboard';
  bare = false;
}

describe('ComingSoonComponent', () => {
  it('renders the screen name and an under-construction message', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('My Dashboard');
    expect(text).toContain('under construction');
  });

  it('uses an h1 in full-page mode', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.bare = false;
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h1')).not.toBeNull();
    expect(host.querySelector('h2')).toBeNull();
  });

  it('uses an h2 when bare', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.bare = true;
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h2')).not.toBeNull();
    expect(host.querySelector('h1')).toBeNull();
  });
});
