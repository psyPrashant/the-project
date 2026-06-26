import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink],
  templateUrl: './employee-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);

  protected readonly searchQuery = signal('');

  protected readonly employees = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q =>
        this.employeeService.getAll(q || undefined).pipe(catchError(() => of([])))
      )
    ),
    { initialValue: [] as EmployeeProfileResponse[] }
  );

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected navigate(id: number): void {
    void this.router.navigate(['/employees', id]);
  }
}
