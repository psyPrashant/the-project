// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
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
  if (stryMutAct_9fa48("10")) {
    {}
  } else {
    stryCov_9fa48("10");
    const authService = inject(AuthService);
    const router = inject(Router);
    const isLoginRequest = req.url.includes(stryMutAct_9fa48("11") ? "" : (stryCov_9fa48("11"), '/auth/login'));
    const authReq = (stryMutAct_9fa48("14") ? !isLoginRequest || authService.getToken() : stryMutAct_9fa48("13") ? false : stryMutAct_9fa48("12") ? true : (stryCov_9fa48("12", "13", "14"), (stryMutAct_9fa48("15") ? isLoginRequest : (stryCov_9fa48("15"), !isLoginRequest)) && authService.getToken())) ? req.clone(stryMutAct_9fa48("16") ? {} : (stryCov_9fa48("16"), {
      setHeaders: stryMutAct_9fa48("17") ? {} : (stryCov_9fa48("17"), {
        Authorization: stryMutAct_9fa48("18") ? `` : (stryCov_9fa48("18"), `Bearer ${authService.getToken()}`)
      })
    })) : req;
    return next(authReq).pipe(catchError(error => {
      if (stryMutAct_9fa48("19")) {
        {}
      } else {
        stryCov_9fa48("19");
        if (stryMutAct_9fa48("22") ? error.status !== 401 : stryMutAct_9fa48("21") ? false : stryMutAct_9fa48("20") ? true : (stryCov_9fa48("20", "21", "22"), error.status === 401)) {
          if (stryMutAct_9fa48("23")) {
            {}
          } else {
            stryCov_9fa48("23");
            authService.logout();
            void router.navigate(stryMutAct_9fa48("24") ? [] : (stryCov_9fa48("24"), [stryMutAct_9fa48("25") ? "" : (stryCov_9fa48("25"), '/login')]));
          }
        }
        return throwError(stryMutAct_9fa48("26") ? () => undefined : (stryCov_9fa48("26"), () => error));
      }
    }));
  }
};