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
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.models';
@Component({
  selector: 'app-my-tasks',
  imports: [RouterLink],
  templateUrl: './my-tasks.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyTasksComponent {
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly tasks = signal<Task[]>(stryMutAct_9fa48("545") ? ["Stryker was here"] : (stryCov_9fa48("545"), []));
  protected readonly loading = signal(stryMutAct_9fa48("546") ? false : (stryCov_9fa48("546"), true));
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly markingDoneId = signal<number | null>(null);
  protected readonly openTasks = computed(stryMutAct_9fa48("547") ? () => undefined : (stryCov_9fa48("547"), () => stryMutAct_9fa48("548") ? this.tasks() : (stryCov_9fa48("548"), this.tasks().filter(stryMutAct_9fa48("549") ? () => undefined : (stryCov_9fa48("549"), t => stryMutAct_9fa48("552") ? t.status !== 'OPEN' : stryMutAct_9fa48("551") ? false : stryMutAct_9fa48("550") ? true : (stryCov_9fa48("550", "551", "552"), t.status === (stryMutAct_9fa48("553") ? "" : (stryCov_9fa48("553"), 'OPEN'))))))));
  protected readonly doneTasks = computed(stryMutAct_9fa48("554") ? () => undefined : (stryCov_9fa48("554"), () => stryMutAct_9fa48("555") ? this.tasks() : (stryCov_9fa48("555"), this.tasks().filter(stryMutAct_9fa48("556") ? () => undefined : (stryCov_9fa48("556"), t => stryMutAct_9fa48("559") ? t.status !== 'DONE' : stryMutAct_9fa48("558") ? false : stryMutAct_9fa48("557") ? true : (stryCov_9fa48("557", "558", "559"), t.status === (stryMutAct_9fa48("560") ? "" : (stryCov_9fa48("560"), 'DONE'))))))));
  constructor() {
    if (stryMutAct_9fa48("561")) {
      {}
    } else {
      stryCov_9fa48("561");
      this.loadTasks();
    }
  }
  private loadTasks(): void {
    if (stryMutAct_9fa48("562")) {
      {}
    } else {
      stryCov_9fa48("562");
      this.loading.set(stryMutAct_9fa48("563") ? false : (stryCov_9fa48("563"), true));
      this.errorMessage.set(null);
      this.taskService.getMyTasks().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("564") ? {} : (stryCov_9fa48("564"), {
        next: tasks => {
          if (stryMutAct_9fa48("565")) {
            {}
          } else {
            stryCov_9fa48("565");
            this.tasks.set(tasks);
            this.loading.set(stryMutAct_9fa48("566") ? true : (stryCov_9fa48("566"), false));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("567")) {
            {}
          } else {
            stryCov_9fa48("567");
            this.loading.set(stryMutAct_9fa48("568") ? true : (stryCov_9fa48("568"), false));
            this.errorMessage.set(stryMutAct_9fa48("569") ? "" : (stryCov_9fa48("569"), 'Failed to load tasks. Please try again.'));
          }
        }
      }));
    }
  }
  protected markDone(task: Task): void {
    if (stryMutAct_9fa48("570")) {
      {}
    } else {
      stryCov_9fa48("570");
      this.markingDoneId.set(task.id);
      this.errorMessage.set(null);
      this.taskService.updateStatus(task.id, stryMutAct_9fa48("571") ? {} : (stryCov_9fa48("571"), {
        status: stryMutAct_9fa48("572") ? "" : (stryCov_9fa48("572"), 'DONE')
      })).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("573") ? {} : (stryCov_9fa48("573"), {
        next: updated => {
          if (stryMutAct_9fa48("574")) {
            {}
          } else {
            stryCov_9fa48("574");
            this.tasks.update(stryMutAct_9fa48("575") ? () => undefined : (stryCov_9fa48("575"), list => list.map(stryMutAct_9fa48("576") ? () => undefined : (stryCov_9fa48("576"), t => (stryMutAct_9fa48("579") ? t.id !== updated.id : stryMutAct_9fa48("578") ? false : stryMutAct_9fa48("577") ? true : (stryCov_9fa48("577", "578", "579"), t.id === updated.id)) ? updated : t))));
            this.markingDoneId.set(null);
          }
        },
        error: () => {
          if (stryMutAct_9fa48("580")) {
            {}
          } else {
            stryCov_9fa48("580");
            this.markingDoneId.set(null);
            this.errorMessage.set(stryMutAct_9fa48("581") ? "" : (stryCov_9fa48("581"), 'Failed to update task. Please try again.'));
          }
        }
      }));
    }
  }
}