import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';
import { EmployeeFormModalComponent } from '../employee-form-modal/employee-form-modal';
import { avatarColor, initials } from '../../shared/avatar';

/**
 * People (TSP-44) — the employee directory as a searchable card list. "Add employee" opens a
 * modal. The backend list returns only active employees, so there is no client archived toggle.
 */
@Component({
  selector: 'app-employee-list',
  imports: [RouterLink, EmployeeFormModalComponent],
  templateUrl: './employee-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  protected readonly avatarColor = avatarColor;
  protected readonly initials = initials;

  protected readonly searchQuery = signal('');
  protected readonly addOpen = signal(false);

  protected readonly employees = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.employeeService.getAll(q || undefined).pipe(catchError(() => of([]))))
    ),
    { initialValue: [] as EmployeeProfileResponse[] }
  );

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected openAdd(): void {
    this.addOpen.set(true);
  }

  protected closeAdd(): void {
    this.addOpen.set(false);
  }

  protected onSaved(employee: EmployeeProfileResponse): void {
    this.addOpen.set(false);
    void this.router.navigate(['/people', employee.id]);
  }
}
