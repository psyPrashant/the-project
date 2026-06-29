import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor';
import { AuthService } from './auth/auth.service';

/**
 * On startup, if a token is already persisted (e.g. the user reloaded the page), resolve the
 * real current Employee from /auth/me before the app renders so guarded routes see a populated
 * user instead of a placeholder. A failed/expired token just logs out; the auth guard then
 * redirects to /login. Runs in the injection context, so inject(AuthService) is safe here.
 */
function initializeCurrentUser(): Promise<void> {
  const auth = inject(AuthService);
  if (!auth.getToken()) {
    return Promise.resolve();
  }
  return firstValueFrom(auth.loadCurrentUser())
    .then(() => undefined)
    .catch(() => auth.logout());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(initializeCurrentUser)
  ]
};