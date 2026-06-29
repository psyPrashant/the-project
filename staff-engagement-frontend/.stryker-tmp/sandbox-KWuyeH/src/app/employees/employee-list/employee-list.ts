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
  protected readonly searchQuery = signal(stryMutAct_9fa48("140") ? "Stryker was here!" : (stryCov_9fa48("140"), ''));
  protected readonly employees = toSignal(toObservable(this.searchQuery).pipe(debounceTime(300), distinctUntilChanged(), switchMap(stryMutAct_9fa48("141") ? () => undefined : (stryCov_9fa48("141"), q => this.employeeService.getAll(stryMutAct_9fa48("144") ? q && undefined : stryMutAct_9fa48("143") ? false : stryMutAct_9fa48("142") ? true : (stryCov_9fa48("142", "143", "144"), q || undefined)).pipe(catchError(stryMutAct_9fa48("145") ? () => undefined : (stryCov_9fa48("145"), () => of(stryMutAct_9fa48("146") ? ["Stryker was here"] : (stryCov_9fa48("146"), [])))))))), stryMutAct_9fa48("147") ? {} : (stryCov_9fa48("147"), {
    initialValue: [] as EmployeeProfileResponse[]
  }));
  protected onSearch(event: Event): void {
    if (stryMutAct_9fa48("148")) {
      {}
    } else {
      stryCov_9fa48("148");
      this.searchQuery.set((event.target as HTMLInputElement).value);
    }
  }
  protected navigate(id: number): void {
    if (stryMutAct_9fa48("149")) {
      {}
    } else {
      stryCov_9fa48("149");
      void this.router.navigate(stryMutAct_9fa48("150") ? [] : (stryCov_9fa48("150"), [stryMutAct_9fa48("151") ? "" : (stryCov_9fa48("151"), '/employees'), id]));
    }
  }
}