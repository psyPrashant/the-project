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
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private readonly destroyRef = inject(DestroyRef);
  protected readonly employee = signal<EmployeeProfileResponse | null>(null);
  protected readonly loading = signal(stryMutAct_9fa48("152") ? false : (stryCov_9fa48("152"), true));
  protected readonly archiving = signal(stryMutAct_9fa48("153") ? true : (stryCov_9fa48("153"), false));
  constructor() {
    if (stryMutAct_9fa48("154")) {
      {}
    } else {
      stryCov_9fa48("154");
      const id = Number(this.route.snapshot.paramMap.get(stryMutAct_9fa48("155") ? "" : (stryCov_9fa48("155"), 'id')));
      this.employeeService.getProfile(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("156") ? {} : (stryCov_9fa48("156"), {
        next: emp => {
          if (stryMutAct_9fa48("157")) {
            {}
          } else {
            stryCov_9fa48("157");
            this.employee.set(emp);
            this.loading.set(stryMutAct_9fa48("158") ? true : (stryCov_9fa48("158"), false));
          }
        },
        error: stryMutAct_9fa48("159") ? () => undefined : (stryCov_9fa48("159"), () => this.loading.set(stryMutAct_9fa48("160") ? true : (stryCov_9fa48("160"), false)))
      }));
    }
  }
  protected archive(): void {
    if (stryMutAct_9fa48("161")) {
      {}
    } else {
      stryCov_9fa48("161");
      const emp = this.employee();
      if (stryMutAct_9fa48("164") ? !emp && this.archiving() : stryMutAct_9fa48("163") ? false : stryMutAct_9fa48("162") ? true : (stryCov_9fa48("162", "163", "164"), (stryMutAct_9fa48("165") ? emp : (stryCov_9fa48("165"), !emp)) || this.archiving())) return;
      this.archiving.set(stryMutAct_9fa48("166") ? false : (stryCov_9fa48("166"), true));
      this.employeeService.archive(emp.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("167") ? {} : (stryCov_9fa48("167"), {
        next: () => {
          if (stryMutAct_9fa48("168")) {
            {}
          } else {
            stryCov_9fa48("168");
            this.employee.set(stryMutAct_9fa48("169") ? {} : (stryCov_9fa48("169"), {
              ...emp,
              archived: stryMutAct_9fa48("170") ? false : (stryCov_9fa48("170"), true)
            }));
            this.archiving.set(stryMutAct_9fa48("171") ? true : (stryCov_9fa48("171"), false));
          }
        },
        error: stryMutAct_9fa48("172") ? () => undefined : (stryCov_9fa48("172"), () => this.archiving.set(stryMutAct_9fa48("173") ? true : (stryCov_9fa48("173"), false)))
      }));
    }
  }
}