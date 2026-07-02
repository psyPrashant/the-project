import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { avatarColor, initials } from '../../shared/avatar';

/**
 * Authenticated app shell for the "Engage" design (TSP-44): a fixed sidebar (brand, primary
 * navigation, signed-in user + sign out) wrapping a scrolling content outlet. The prototype's
 * user-switcher is intentionally replaced by the real current user resolved from auth (D3).
 */
@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.auth.currentUser;
  protected readonly userName = computed(() => {
    const user = this.auth.currentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });
  protected readonly userInitials = computed(() => initials(this.userName()));
  protected readonly userColor = computed(() => avatarColor(this.auth.currentUser()?.id ?? ''));
  protected readonly profileLink = computed(() => {
    const user = this.auth.currentUser();
    return user ? ['/people', user.id] : null;
  });

  protected signOut(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
