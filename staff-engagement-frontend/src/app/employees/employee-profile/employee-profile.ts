import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EmployeeService } from '../employee.service';
import { EmployeeProfileResponse } from '../employee.models';

@Component({
  selector: 'app-employee-profile',
  imports: [RouterLink],
  templateUrl: './employee-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeProfileComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly employee = signal<EmployeeProfileResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly archiving = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.employeeService.getProfile(id).subscribe({
      next: emp => {
        this.employee.set(emp);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected archive(): void {
    const emp = this.employee();
    if (!emp) return;
    this.archiving.set(true);
    this.employeeService.archive(emp.id).subscribe({
      next: () => {
        this.employee.set({ ...emp, archived: true });
        this.archiving.set(false);
      },
      error: () => this.archiving.set(false)
    });
  }
}
