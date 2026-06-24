import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.currentUser;
  protected readonly greeting = computed(() => {
    const user = this.user();
    return user ? `Welcome, ${user.firstName}` : 'Welcome';
  });

  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}