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
import { Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { TaskService } from '../task.service';
interface CreateTaskForm {
  relatesToId: FormControl<number | null>;
  title: FormControl<string>;
  description: FormControl<string>;
  dueDate: FormControl<string>;
  assigneeId: FormControl<number | null>;
}
@Component({
  selector: 'app-create-task',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-task.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTaskComponent {
  private readonly taskService = inject(TaskService);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly employees = signal<EmployeeProfileResponse[]>(stryMutAct_9fa48("439") ? ["Stryker was here"] : (stryCov_9fa48("439"), []));
  protected readonly loadingEmployees = signal(stryMutAct_9fa48("440") ? false : (stryCov_9fa48("440"), true));
  protected readonly submitting = signal(stryMutAct_9fa48("441") ? true : (stryCov_9fa48("441"), false));
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = new FormGroup<CreateTaskForm>(stryMutAct_9fa48("442") ? {} : (stryCov_9fa48("442"), {
    relatesToId: new FormControl<number | null>(null, stryMutAct_9fa48("443") ? {} : (stryCov_9fa48("443"), {
      validators: stryMutAct_9fa48("444") ? [] : (stryCov_9fa48("444"), [Validators.required])
    })),
    title: new FormControl(stryMutAct_9fa48("445") ? "Stryker was here!" : (stryCov_9fa48("445"), ''), stryMutAct_9fa48("446") ? {} : (stryCov_9fa48("446"), {
      nonNullable: stryMutAct_9fa48("447") ? false : (stryCov_9fa48("447"), true),
      validators: stryMutAct_9fa48("448") ? [] : (stryCov_9fa48("448"), [Validators.required])
    })),
    description: new FormControl(stryMutAct_9fa48("449") ? "Stryker was here!" : (stryCov_9fa48("449"), ''), stryMutAct_9fa48("450") ? {} : (stryCov_9fa48("450"), {
      nonNullable: stryMutAct_9fa48("451") ? false : (stryCov_9fa48("451"), true)
    })),
    dueDate: new FormControl(stryMutAct_9fa48("452") ? "Stryker was here!" : (stryCov_9fa48("452"), ''), stryMutAct_9fa48("453") ? {} : (stryCov_9fa48("453"), {
      nonNullable: stryMutAct_9fa48("454") ? false : (stryCov_9fa48("454"), true)
    })),
    assigneeId: new FormControl<number | null>(null)
  }));
  constructor() {
    if (stryMutAct_9fa48("455")) {
      {}
    } else {
      stryCov_9fa48("455");
      this.employeeService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("456") ? {} : (stryCov_9fa48("456"), {
        next: list => {
          if (stryMutAct_9fa48("457")) {
            {}
          } else {
            stryCov_9fa48("457");
            this.employees.set(list);
            this.loadingEmployees.set(stryMutAct_9fa48("458") ? true : (stryCov_9fa48("458"), false));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("459")) {
            {}
          } else {
            stryCov_9fa48("459");
            this.loadingEmployees.set(stryMutAct_9fa48("460") ? true : (stryCov_9fa48("460"), false));
            this.errorMessage.set(stryMutAct_9fa48("461") ? "" : (stryCov_9fa48("461"), 'Failed to load employees.'));
          }
        }
      }));
    }
  }
  protected onSubmit(): void {
    if (stryMutAct_9fa48("462")) {
      {}
    } else {
      stryCov_9fa48("462");
      if (stryMutAct_9fa48("464") ? false : stryMutAct_9fa48("463") ? true : (stryCov_9fa48("463", "464"), this.form.invalid)) {
        if (stryMutAct_9fa48("465")) {
          {}
        } else {
          stryCov_9fa48("465");
          this.form.markAllAsTouched();
          return;
        }
      }
      const raw = this.form.getRawValue();
      if (stryMutAct_9fa48("468") ? raw.relatesToId !== null : stryMutAct_9fa48("467") ? false : stryMutAct_9fa48("466") ? true : (stryCov_9fa48("466", "467", "468"), raw.relatesToId === null)) return;
      this.submitting.set(stryMutAct_9fa48("469") ? false : (stryCov_9fa48("469"), true));
      this.errorMessage.set(null);
      this.taskService.createStandalone(stryMutAct_9fa48("470") ? {} : (stryCov_9fa48("470"), {
        relatesToId: raw.relatesToId,
        title: raw.title,
        description: stryMutAct_9fa48("473") ? raw.description && undefined : stryMutAct_9fa48("472") ? false : stryMutAct_9fa48("471") ? true : (stryCov_9fa48("471", "472", "473"), raw.description || undefined),
        dueDate: stryMutAct_9fa48("476") ? raw.dueDate && undefined : stryMutAct_9fa48("475") ? false : stryMutAct_9fa48("474") ? true : (stryCov_9fa48("474", "475", "476"), raw.dueDate || undefined),
        assigneeId: stryMutAct_9fa48("477") ? raw.assigneeId && undefined : (stryCov_9fa48("477"), raw.assigneeId ?? undefined)
      })).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("478") ? {} : (stryCov_9fa48("478"), {
        next: () => {
          if (stryMutAct_9fa48("479")) {
            {}
          } else {
            stryCov_9fa48("479");
            this.submitting.set(stryMutAct_9fa48("480") ? true : (stryCov_9fa48("480"), false));
            void this.router.navigate(stryMutAct_9fa48("481") ? [] : (stryCov_9fa48("481"), [stryMutAct_9fa48("482") ? "" : (stryCov_9fa48("482"), '/tasks/mine')]));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("483")) {
            {}
          } else {
            stryCov_9fa48("483");
            this.submitting.set(stryMutAct_9fa48("484") ? true : (stryCov_9fa48("484"), false));
            this.errorMessage.set(stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), 'Failed to create task. Please try again.'));
          }
        }
      }));
    }
  }
  protected cancel(): void {
    if (stryMutAct_9fa48("486")) {
      {}
    } else {
      stryCov_9fa48("486");
      void this.router.navigate(stryMutAct_9fa48("487") ? [] : (stryCov_9fa48("487"), [stryMutAct_9fa48("488") ? "" : (stryCov_9fa48("488"), '/tasks/mine')]));
    }
  }
}