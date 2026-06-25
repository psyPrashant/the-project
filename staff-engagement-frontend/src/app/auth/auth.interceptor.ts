import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Functional interceptor: attaches the Bearer token to outgoing requests (except the login
 * endpoint) and redirects to `/login` on a 401.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoginRequest = req.url.includes('/auth/login');

  const authReq = !isLoginRequest && authService.getToken()
    ? req.clone({ setHeaders: { Authorization: `Bearer ${authService.getToken()}` } })
    : req;

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        authService.logout();
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};