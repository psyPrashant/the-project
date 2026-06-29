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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { TaskService } from '../task.service';
interface CreateFromInteractionForm {
  title: FormControl<string>;
  description: FormControl<string>;
  dueDate: FormControl<string>;
  assigneeId: FormControl<number | null>;
}
@Component({
  selector: 'app-create-task-from-interaction',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './create-task-from-interaction.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTaskFromInteractionComponent {
  private readonly taskService = inject(TaskService);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly interactionId = signal(Number(this.route.snapshot.paramMap.get(stryMutAct_9fa48("489") ? "" : (stryCov_9fa48("489"), 'id'))));
  protected readonly employees = signal<EmployeeProfileResponse[]>(stryMutAct_9fa48("490") ? ["Stryker was here"] : (stryCov_9fa48("490"), []));
  protected readonly loadingEmployees = signal(stryMutAct_9fa48("491") ? false : (stryCov_9fa48("491"), true));
  protected readonly submitting = signal(stryMutAct_9fa48("492") ? true : (stryCov_9fa48("492"), false));
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = new FormGroup<CreateFromInteractionForm>(stryMutAct_9fa48("493") ? {} : (stryCov_9fa48("493"), {
    title: new FormControl(stryMutAct_9fa48("494") ? "Stryker was here!" : (stryCov_9fa48("494"), ''), stryMutAct_9fa48("495") ? {} : (stryCov_9fa48("495"), {
      nonNullable: stryMutAct_9fa48("496") ? false : (stryCov_9fa48("496"), true),
      validators: stryMutAct_9fa48("497") ? [] : (stryCov_9fa48("497"), [Validators.required])
    })),
    description: new FormControl(stryMutAct_9fa48("498") ? "Stryker was here!" : (stryCov_9fa48("498"), ''), stryMutAct_9fa48("499") ? {} : (stryCov_9fa48("499"), {
      nonNullable: stryMutAct_9fa48("500") ? false : (stryCov_9fa48("500"), true)
    })),
    dueDate: new FormControl(stryMutAct_9fa48("501") ? "Stryker was here!" : (stryCov_9fa48("501"), ''), stryMutAct_9fa48("502") ? {} : (stryCov_9fa48("502"), {
      nonNullable: stryMutAct_9fa48("503") ? false : (stryCov_9fa48("503"), true)
    })),
    assigneeId: new FormControl<number | null>(null)
  }));
  constructor() {
    if (stryMutAct_9fa48("504")) {
      {}
    } else {
      stryCov_9fa48("504");
      if (stryMutAct_9fa48("507") ? !Number.isFinite(this.interactionId()) && this.interactionId() <= 0 : stryMutAct_9fa48("506") ? false : stryMutAct_9fa48("505") ? true : (stryCov_9fa48("505", "506", "507"), (stryMutAct_9fa48("508") ? Number.isFinite(this.interactionId()) : (stryCov_9fa48("508"), !Number.isFinite(this.interactionId()))) || (stryMutAct_9fa48("511") ? this.interactionId() > 0 : stryMutAct_9fa48("510") ? this.interactionId() < 0 : stryMutAct_9fa48("509") ? false : (stryCov_9fa48("509", "510", "511"), this.interactionId() <= 0)))) {
        if (stryMutAct_9fa48("512")) {
          {}
        } else {
          stryCov_9fa48("512");
          this.loadingEmployees.set(stryMutAct_9fa48("513") ? true : (stryCov_9fa48("513"), false));
          this.errorMessage.set(stryMutAct_9fa48("514") ? "" : (stryCov_9fa48("514"), 'Invalid interaction reference. Please go back and try again.'));
          return;
        }
      }
      this.employeeService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("515") ? {} : (stryCov_9fa48("515"), {
        next: list => {
          if (stryMutAct_9fa48("516")) {
            {}
          } else {
            stryCov_9fa48("516");
            this.employees.set(list);
            this.loadingEmployees.set(stryMutAct_9fa48("517") ? true : (stryCov_9fa48("517"), false));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("518")) {
            {}
          } else {
            stryCov_9fa48("518");
            this.loadingEmployees.set(stryMutAct_9fa48("519") ? true : (stryCov_9fa48("519"), false));
            this.errorMessage.set(stryMutAct_9fa48("520") ? "" : (stryCov_9fa48("520"), 'Failed to load employees.'));
          }
        }
      }));
    }
  }
  protected onSubmit(): void {
    if (stryMutAct_9fa48("521")) {
      {}
    } else {
      stryCov_9fa48("521");
      if (stryMutAct_9fa48("523") ? false : stryMutAct_9fa48("522") ? true : (stryCov_9fa48("522", "523"), this.form.invalid)) {
        if (stryMutAct_9fa48("524")) {
          {}
        } else {
          stryCov_9fa48("524");
          this.form.markAllAsTouched();
          return;
        }
      }
      const raw = this.form.getRawValue();
      this.submitting.set(stryMutAct_9fa48("525") ? false : (stryCov_9fa48("525"), true));
      this.errorMessage.set(null);
      this.taskService.createFromInteraction(stryMutAct_9fa48("526") ? {} : (stryCov_9fa48("526"), {
        interactionId: this.interactionId(),
        title: raw.title,
        description: stryMutAct_9fa48("529") ? raw.description && undefined : stryMutAct_9fa48("528") ? false : stryMutAct_9fa48("527") ? true : (stryCov_9fa48("527", "528", "529"), raw.description || undefined),
        dueDate: stryMutAct_9fa48("532") ? raw.dueDate && undefined : stryMutAct_9fa48("531") ? false : stryMutAct_9fa48("530") ? true : (stryCov_9fa48("530", "531", "532"), raw.dueDate || undefined),
        assigneeId: stryMutAct_9fa48("533") ? raw.assigneeId && undefined : (stryCov_9fa48("533"), raw.assigneeId ?? undefined)
      })).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("534") ? {} : (stryCov_9fa48("534"), {
        next: () => {
          if (stryMutAct_9fa48("535")) {
            {}
          } else {
            stryCov_9fa48("535");
            this.submitting.set(stryMutAct_9fa48("536") ? true : (stryCov_9fa48("536"), false));
            void this.router.navigate(stryMutAct_9fa48("537") ? [] : (stryCov_9fa48("537"), [stryMutAct_9fa48("538") ? "" : (stryCov_9fa48("538"), '/tasks/mine')]));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("539")) {
            {}
          } else {
            stryCov_9fa48("539");
            this.submitting.set(stryMutAct_9fa48("540") ? true : (stryCov_9fa48("540"), false));
            this.errorMessage.set(stryMutAct_9fa48("541") ? "" : (stryCov_9fa48("541"), 'Failed to create task. Please try again.'));
          }
        }
      }));
    }
  }
  protected cancel(): void {
    if (stryMutAct_9fa48("542")) {
      {}
    } else {
      stryCov_9fa48("542");
      void this.router.navigate(stryMutAct_9fa48("543") ? [] : (stryCov_9fa48("543"), [stryMutAct_9fa48("544") ? "" : (stryCov_9fa48("544"), '/tasks/mine')]));
    }
  }
}