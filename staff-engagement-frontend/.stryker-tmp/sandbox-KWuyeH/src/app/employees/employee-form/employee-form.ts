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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeFormComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly employeeId = signal<number | undefined>(this.route.snapshot.paramMap.get(stryMutAct_9fa48("63") ? "" : (stryCov_9fa48("63"), 'id')) ? Number(this.route.snapshot.paramMap.get(stryMutAct_9fa48("64") ? "" : (stryCov_9fa48("64"), 'id'))) : undefined);
  protected readonly isEdit = signal(stryMutAct_9fa48("67") ? this.employeeId() === undefined : stryMutAct_9fa48("66") ? false : stryMutAct_9fa48("65") ? true : (stryCov_9fa48("65", "66", "67"), this.employeeId() !== undefined));
  protected readonly submitting = signal(stryMutAct_9fa48("68") ? true : (stryCov_9fa48("68"), false));
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = new FormGroup(stryMutAct_9fa48("69") ? {} : (stryCov_9fa48("69"), {
    firstName: new FormControl(stryMutAct_9fa48("70") ? "Stryker was here!" : (stryCov_9fa48("70"), ''), stryMutAct_9fa48("71") ? {} : (stryCov_9fa48("71"), {
      nonNullable: stryMutAct_9fa48("72") ? false : (stryCov_9fa48("72"), true),
      validators: stryMutAct_9fa48("73") ? [] : (stryCov_9fa48("73"), [Validators.required])
    })),
    lastName: new FormControl(stryMutAct_9fa48("74") ? "Stryker was here!" : (stryCov_9fa48("74"), ''), stryMutAct_9fa48("75") ? {} : (stryCov_9fa48("75"), {
      nonNullable: stryMutAct_9fa48("76") ? false : (stryCov_9fa48("76"), true),
      validators: stryMutAct_9fa48("77") ? [] : (stryCov_9fa48("77"), [Validators.required])
    })),
    email: new FormControl(stryMutAct_9fa48("78") ? "Stryker was here!" : (stryCov_9fa48("78"), ''), stryMutAct_9fa48("79") ? {} : (stryCov_9fa48("79"), {
      nonNullable: stryMutAct_9fa48("80") ? false : (stryCov_9fa48("80"), true),
      validators: stryMutAct_9fa48("81") ? [] : (stryCov_9fa48("81"), [Validators.required, Validators.email])
    })),
    jobTitle: new FormControl(stryMutAct_9fa48("82") ? "Stryker was here!" : (stryCov_9fa48("82"), ''), stryMutAct_9fa48("83") ? {} : (stryCov_9fa48("83"), {
      nonNullable: stryMutAct_9fa48("84") ? false : (stryCov_9fa48("84"), true)
    })),
    department: new FormControl(stryMutAct_9fa48("85") ? "Stryker was here!" : (stryCov_9fa48("85"), ''), stryMutAct_9fa48("86") ? {} : (stryCov_9fa48("86"), {
      nonNullable: stryMutAct_9fa48("87") ? false : (stryCov_9fa48("87"), true)
    })),
    phone: new FormControl(stryMutAct_9fa48("88") ? "Stryker was here!" : (stryCov_9fa48("88"), ''), stryMutAct_9fa48("89") ? {} : (stryCov_9fa48("89"), {
      nonNullable: stryMutAct_9fa48("90") ? false : (stryCov_9fa48("90"), true)
    }))
  }));
  constructor() {
    if (stryMutAct_9fa48("91")) {
      {}
    } else {
      stryCov_9fa48("91");
      const id = this.employeeId();
      if (stryMutAct_9fa48("94") ? id === undefined : stryMutAct_9fa48("93") ? false : stryMutAct_9fa48("92") ? true : (stryCov_9fa48("92", "93", "94"), id !== undefined)) {
        if (stryMutAct_9fa48("95")) {
          {}
        } else {
          stryCov_9fa48("95");
          this.employeeService.getProfile(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("96") ? {} : (stryCov_9fa48("96"), {
            next: emp => {
              if (stryMutAct_9fa48("97")) {
                {}
              } else {
                stryCov_9fa48("97");
                this.form.patchValue(stryMutAct_9fa48("98") ? {} : (stryCov_9fa48("98"), {
                  firstName: emp.firstName,
                  lastName: emp.lastName,
                  email: emp.email,
                  jobTitle: stryMutAct_9fa48("99") ? emp.jobTitle && '' : (stryCov_9fa48("99"), emp.jobTitle ?? (stryMutAct_9fa48("100") ? "Stryker was here!" : (stryCov_9fa48("100"), ''))),
                  department: stryMutAct_9fa48("101") ? emp.department && '' : (stryCov_9fa48("101"), emp.department ?? (stryMutAct_9fa48("102") ? "Stryker was here!" : (stryCov_9fa48("102"), ''))),
                  phone: stryMutAct_9fa48("103") ? emp.phone && '' : (stryCov_9fa48("103"), emp.phone ?? (stryMutAct_9fa48("104") ? "Stryker was here!" : (stryCov_9fa48("104"), '')))
                }));
              }
            },
            error: stryMutAct_9fa48("105") ? () => undefined : (stryCov_9fa48("105"), () => this.errorMessage.set(stryMutAct_9fa48("106") ? "" : (stryCov_9fa48("106"), 'Failed to load employee data.')))
          }));
        }
      }
    }
  }
  protected onSubmit(): void {
    if (stryMutAct_9fa48("107")) {
      {}
    } else {
      stryCov_9fa48("107");
      if (stryMutAct_9fa48("109") ? false : stryMutAct_9fa48("108") ? true : (stryCov_9fa48("108", "109"), this.form.invalid)) return;
      this.submitting.set(stryMutAct_9fa48("110") ? false : (stryCov_9fa48("110"), true));
      this.errorMessage.set(null);
      const {
        firstName,
        lastName,
        email,
        jobTitle,
        department,
        phone
      } = this.form.getRawValue();
      const request = stryMutAct_9fa48("111") ? {} : (stryCov_9fa48("111"), {
        firstName,
        lastName,
        email,
        jobTitle: stryMutAct_9fa48("114") ? jobTitle && undefined : stryMutAct_9fa48("113") ? false : stryMutAct_9fa48("112") ? true : (stryCov_9fa48("112", "113", "114"), jobTitle || undefined),
        department: stryMutAct_9fa48("117") ? department && undefined : stryMutAct_9fa48("116") ? false : stryMutAct_9fa48("115") ? true : (stryCov_9fa48("115", "116", "117"), department || undefined),
        phone: stryMutAct_9fa48("120") ? phone && undefined : stryMutAct_9fa48("119") ? false : stryMutAct_9fa48("118") ? true : (stryCov_9fa48("118", "119", "120"), phone || undefined)
      });
      const id = this.employeeId();
      const operation = (stryMutAct_9fa48("123") ? id === undefined : stryMutAct_9fa48("122") ? false : stryMutAct_9fa48("121") ? true : (stryCov_9fa48("121", "122", "123"), id !== undefined)) ? this.employeeService.update(id, request) : this.employeeService.create(request);
      operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("124") ? {} : (stryCov_9fa48("124"), {
        next: employee => {
          if (stryMutAct_9fa48("125")) {
            {}
          } else {
            stryCov_9fa48("125");
            this.submitting.set(stryMutAct_9fa48("126") ? true : (stryCov_9fa48("126"), false));
            void this.router.navigate(stryMutAct_9fa48("127") ? [] : (stryCov_9fa48("127"), [stryMutAct_9fa48("128") ? "" : (stryCov_9fa48("128"), '/employees'), employee.id]));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("129")) {
            {}
          } else {
            stryCov_9fa48("129");
            this.submitting.set(stryMutAct_9fa48("130") ? true : (stryCov_9fa48("130"), false));
            this.errorMessage.set(stryMutAct_9fa48("131") ? "" : (stryCov_9fa48("131"), 'Failed to save employee. Please try again.'));
          }
        }
      }));
    }
  }
  protected cancel(): void {
    if (stryMutAct_9fa48("132")) {
      {}
    } else {
      stryCov_9fa48("132");
      const id = this.employeeId();
      void this.router.navigate((stryMutAct_9fa48("135") ? id === undefined : stryMutAct_9fa48("134") ? false : stryMutAct_9fa48("133") ? true : (stryCov_9fa48("133", "134", "135"), id !== undefined)) ? stryMutAct_9fa48("136") ? [] : (stryCov_9fa48("136"), [stryMutAct_9fa48("137") ? "" : (stryCov_9fa48("137"), '/employees'), id]) : stryMutAct_9fa48("138") ? [] : (stryCov_9fa48("138"), [stryMutAct_9fa48("139") ? "" : (stryCov_9fa48("139"), '/employees')]));
    }
  }
}