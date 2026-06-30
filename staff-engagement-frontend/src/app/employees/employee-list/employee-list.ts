import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';
import { EmployeeFormModalComponent } from '../employee-form-modal/employee-form-modal';
import { avatarColor, initials } from '../../shared/avatar';

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
  protected readonly showArchived = signal(false);
  protected readonly addOpen = signal(false);

  protected readonly employees = toSignal(
    combineLatest([
      toObservable(this.searchQuery).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.showArchived)
    ]).pipe(
      switchMap(([q, includeArchived]) =>
        this.employeeService.getAll(q || undefined, includeArchived || undefined).pipe(catchError(() => of([])))
      )
    ),
    { initialValue: [] as EmployeeProfileResponse[] }
  );

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onToggleArchived(event: Event): void {
    this.showArchived.set((event.target as HTMLInputElement).checked);
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
