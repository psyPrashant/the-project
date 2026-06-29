import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi, beforeEach, describe, it, expect } from 'vitest';

import { EmployeeFormModalComponent } from './employee-form-modal';
import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';

const created: EmployeeProfileResponse = {
  id: 99, firstName: 'Naledi', lastName: 'Khumalo', email: 'naledi@acme.co',
  jobTitle: 'Backend Engineer', department: 'Platform', phone: null, archived: false
};

@Component({
  imports: [EmployeeFormModalComponent],
  template: `<app-employee-form-modal [open]="true" (saved)="savedEmp = $event" />`
})
class HostComponent {
  savedEmp: EmployeeProfileResponse | null = null;
}

describe('EmployeeFormModalComponent', () => {
  let createSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createSpy = vi.fn().mockReturnValue(of(created));
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: EmployeeService, useValue: { create: createSpy, update: vi.fn() } }]
    });
  });

  function setInput(host: HTMLElement, id: string, value: string) {
    const input = host.querySelector(`#${id}`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function footerSaveButton(host: HTMLElement): HTMLButtonElement {
    const buttons = host.querySelectorAll('footer button');
    return buttons[buttons.length - 1] as HTMLButtonElement;
  }

  it('renders the add-employee fields when open', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('#emp-firstName')).not.toBeNull();
    expect(host.querySelector('#emp-email')).not.toBeNull();
    expect(host.textContent).toContain('Add employee');
  });

  it('does not create when required fields are empty', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    footerSaveButton(fixture.nativeElement as HTMLElement).click();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('creates the employee and emits saved on a valid submit', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    setInput(host, 'emp-firstName', 'Naledi');
    setInput(host, 'emp-lastName', 'Khumalo');
    setInput(host, 'emp-email', 'naledi@acme.co');
    fixture.detectChanges();

    footerSaveButton(host).click();

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Naledi', lastName: 'Khumalo', email: 'naledi@acme.co' })
    );
    expect(fixture.componentInstance.savedEmp).toEqual(created);
  });
});
