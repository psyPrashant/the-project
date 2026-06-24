import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Redirects unauthenticated users to `/login`, preserving the intended URL in `redirect`. */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return new RedirectCommand(
    router.createUrlTree(['/login'], { queryParams: { redirect: state.url } })
  );
};