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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, forkJoin } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionService } from '../interaction.service';
import { InteractionFilter, InteractionResponse, InteractionType } from '../interaction.models';
interface InteractionFilterForm {
  type: FormControl<InteractionType | null>;
  authorId: FormControl<number | null>;
  date: FormControl<string | null>;
}
@Component({
  selector: 'app-interaction-timeline',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './interaction-timeline.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionTimelineComponent {
  private readonly interactionService = inject(InteractionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly subjectId = signal(Number(this.route.snapshot.paramMap.get(stryMutAct_9fa48("330") ? "" : (stryCov_9fa48("330"), 'id'))));
  protected readonly employee = signal<EmployeeProfileResponse | null>(null);
  protected readonly interactions = signal<InteractionResponse[]>(stryMutAct_9fa48("331") ? ["Stryker was here"] : (stryCov_9fa48("331"), []));
  protected readonly employees = signal<EmployeeProfileResponse[]>(stryMutAct_9fa48("332") ? ["Stryker was here"] : (stryCov_9fa48("332"), []));
  protected readonly loading = signal(stryMutAct_9fa48("333") ? false : (stryCov_9fa48("333"), true));
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly filterForm = new FormGroup<InteractionFilterForm>(stryMutAct_9fa48("334") ? {} : (stryCov_9fa48("334"), {
    type: new FormControl<InteractionType | null>(null),
    authorId: new FormControl<number | null>(null),
    date: new FormControl<string | null>(null)
  }));
  protected readonly currentUser = this.authService.currentUser;
  protected readonly interactionTypes = Object.values(InteractionType);
  protected readonly sortedInteractions = computed(() => {
    if (stryMutAct_9fa48("335")) {
      {}
    } else {
      stryCov_9fa48("335");
      return stryMutAct_9fa48("336") ? [...this.interactions()] : (stryCov_9fa48("336"), (stryMutAct_9fa48("337") ? [] : (stryCov_9fa48("337"), [...this.interactions()])).sort(stryMutAct_9fa48("338") ? () => undefined : (stryCov_9fa48("338"), (a, b) => stryMutAct_9fa48("339") ? new Date(b.date).getTime() + new Date(a.date).getTime() : (stryCov_9fa48("339"), new Date(b.date).getTime() - new Date(a.date).getTime()))));
    }
  });
  constructor() {
    if (stryMutAct_9fa48("340")) {
      {}
    } else {
      stryCov_9fa48("340");
      const id = this.subjectId();
      if (stryMutAct_9fa48("343") ? !Number.isFinite(id) && id <= 0 : stryMutAct_9fa48("342") ? false : stryMutAct_9fa48("341") ? true : (stryCov_9fa48("341", "342", "343"), (stryMutAct_9fa48("344") ? Number.isFinite(id) : (stryCov_9fa48("344"), !Number.isFinite(id))) || (stryMutAct_9fa48("347") ? id > 0 : stryMutAct_9fa48("346") ? id < 0 : stryMutAct_9fa48("345") ? false : (stryCov_9fa48("345", "346", "347"), id <= 0)))) {
        if (stryMutAct_9fa48("348")) {
          {}
        } else {
          stryCov_9fa48("348");
          this.loading.set(stryMutAct_9fa48("349") ? true : (stryCov_9fa48("349"), false));
          this.errorMessage.set(stryMutAct_9fa48("350") ? "" : (stryCov_9fa48("350"), 'Invalid employee id.'));
          return;
        }
      }
      if (stryMutAct_9fa48("353") ? this.currentUser() !== null : stryMutAct_9fa48("352") ? false : stryMutAct_9fa48("351") ? true : (stryCov_9fa48("351", "352", "353"), this.currentUser() === null)) {
        if (stryMutAct_9fa48("354")) {
          {}
        } else {
          stryCov_9fa48("354");
          this.authService.loadCurrentUser().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("355") ? {} : (stryCov_9fa48("355"), {
            error: () => {/* best-effort */}
          }));
        }
      }
      this.employeeService.getAll().pipe(catchError(() => {
        if (stryMutAct_9fa48("356")) {
          {}
        } else {
          stryCov_9fa48("356");
          this.errorMessage.set(stryMutAct_9fa48("357") ? "" : (stryCov_9fa48("357"), 'Failed to load employees for filter.'));
          return EMPTY;
        }
      }), takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("358") ? () => undefined : (stryCov_9fa48("358"), employees => this.employees.set(employees)));
      this.loadInteractions(id);
    }
  }
  private loadInteractions(id: number, filter?: InteractionFilter): void {
    if (stryMutAct_9fa48("359")) {
      {}
    } else {
      stryCov_9fa48("359");
      this.loading.set(stryMutAct_9fa48("360") ? false : (stryCov_9fa48("360"), true));
      this.errorMessage.set(null);
      forkJoin(stryMutAct_9fa48("361") ? {} : (stryCov_9fa48("361"), {
        employee: this.employeeService.getProfile(id),
        interactions: this.interactionService.findBySubject(id, filter)
      })).pipe(catchError(() => {
        if (stryMutAct_9fa48("362")) {
          {}
        } else {
          stryCov_9fa48("362");
          this.loading.set(stryMutAct_9fa48("363") ? true : (stryCov_9fa48("363"), false));
          this.errorMessage.set(stryMutAct_9fa48("364") ? "" : (stryCov_9fa48("364"), 'Failed to load interactions.'));
          return EMPTY;
        }
      }), takeUntilDestroyed(this.destroyRef)).subscribe(result => {
        if (stryMutAct_9fa48("365")) {
          {}
        } else {
          stryCov_9fa48("365");
          this.employee.set(result.employee);
          this.interactions.set(result.interactions);
          this.loading.set(stryMutAct_9fa48("366") ? true : (stryCov_9fa48("366"), false));
        }
      });
    }
  }
  protected applyFilters(): void {
    if (stryMutAct_9fa48("367")) {
      {}
    } else {
      stryCov_9fa48("367");
      this.loadInteractions(this.subjectId(), this.filterForm.getRawValue());
    }
  }
  protected resetFilters(): void {
    if (stryMutAct_9fa48("368")) {
      {}
    } else {
      stryCov_9fa48("368");
      this.filterForm.reset(stryMutAct_9fa48("369") ? {} : (stryCov_9fa48("369"), {
        type: null,
        authorId: null,
        date: null
      }));
      this.loadInteractions(this.subjectId());
    }
  }
  protected isAuthor(interaction: InteractionResponse): boolean {
    if (stryMutAct_9fa48("370")) {
      {}
    } else {
      stryCov_9fa48("370");
      const user = this.currentUser();
      return stryMutAct_9fa48("373") ? user !== null || interaction.author.id === user.id : stryMutAct_9fa48("372") ? false : stryMutAct_9fa48("371") ? true : (stryCov_9fa48("371", "372", "373"), (stryMutAct_9fa48("375") ? user === null : stryMutAct_9fa48("374") ? true : (stryCov_9fa48("374", "375"), user !== null)) && (stryMutAct_9fa48("377") ? interaction.author.id !== user.id : stryMutAct_9fa48("376") ? true : (stryCov_9fa48("376", "377"), interaction.author.id === user.id)));
    }
  }
  protected logInteraction(): void {
    if (stryMutAct_9fa48("378")) {
      {}
    } else {
      stryCov_9fa48("378");
      void this.router.navigate(stryMutAct_9fa48("379") ? [] : (stryCov_9fa48("379"), [stryMutAct_9fa48("380") ? "" : (stryCov_9fa48("380"), '/interactions/new')]), stryMutAct_9fa48("381") ? {} : (stryCov_9fa48("381"), {
        queryParams: stryMutAct_9fa48("382") ? {} : (stryCov_9fa48("382"), {
          subjectId: this.subjectId()
        })
      }));
    }
  }
  protected editInteraction(interaction: InteractionResponse): void {
    if (stryMutAct_9fa48("383")) {
      {}
    } else {
      stryCov_9fa48("383");
      void this.router.navigate(stryMutAct_9fa48("384") ? [] : (stryCov_9fa48("384"), [stryMutAct_9fa48("385") ? "" : (stryCov_9fa48("385"), '/interactions'), interaction.id, stryMutAct_9fa48("386") ? "" : (stryCov_9fa48("386"), 'edit')]));
    }
  }
  protected createTaskFromInteraction(interaction: InteractionResponse): void {
    if (stryMutAct_9fa48("387")) {
      {}
    } else {
      stryCov_9fa48("387");
      void this.router.navigate(stryMutAct_9fa48("388") ? [] : (stryCov_9fa48("388"), [stryMutAct_9fa48("389") ? "" : (stryCov_9fa48("389"), '/interactions'), interaction.id, stryMutAct_9fa48("390") ? "" : (stryCov_9fa48("390"), 'create-task')]));
    }
  }
  protected deleteInteraction(interaction: InteractionResponse): void {
    if (stryMutAct_9fa48("391")) {
      {}
    } else {
      stryCov_9fa48("391");
      if (stryMutAct_9fa48("394") ? false : stryMutAct_9fa48("393") ? true : stryMutAct_9fa48("392") ? this.isAuthor(interaction) : (stryCov_9fa48("392", "393", "394"), !this.isAuthor(interaction))) {
        if (stryMutAct_9fa48("395")) {
          {}
        } else {
          stryCov_9fa48("395");
          return;
        }
      }
      if (stryMutAct_9fa48("398") ? false : stryMutAct_9fa48("397") ? true : stryMutAct_9fa48("396") ? confirm('Are you sure you want to delete this interaction?') : (stryCov_9fa48("396", "397", "398"), !confirm(stryMutAct_9fa48("399") ? "" : (stryCov_9fa48("399"), 'Are you sure you want to delete this interaction?')))) {
        if (stryMutAct_9fa48("400")) {
          {}
        } else {
          stryCov_9fa48("400");
          return;
        }
      }
      this.deletingId.set(interaction.id);
      this.errorMessage.set(null);
      this.interactionService.delete(interaction.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("401") ? {} : (stryCov_9fa48("401"), {
        next: () => {
          if (stryMutAct_9fa48("402")) {
            {}
          } else {
            stryCov_9fa48("402");
            this.deletingId.set(null);
            this.interactions.update(stryMutAct_9fa48("403") ? () => undefined : (stryCov_9fa48("403"), list => stryMutAct_9fa48("404") ? list : (stryCov_9fa48("404"), list.filter(stryMutAct_9fa48("405") ? () => undefined : (stryCov_9fa48("405"), i => stryMutAct_9fa48("408") ? i.id === interaction.id : stryMutAct_9fa48("407") ? false : stryMutAct_9fa48("406") ? true : (stryCov_9fa48("406", "407", "408"), i.id !== interaction.id))))));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("409")) {
            {}
          } else {
            stryCov_9fa48("409");
            this.deletingId.set(null);
            this.errorMessage.set(stryMutAct_9fa48("410") ? "" : (stryCov_9fa48("410"), 'Failed to delete interaction. Please try again.'));
          }
        }
      }));
    }
  }
  protected formatDate(isoDate: string): string {
    if (stryMutAct_9fa48("411")) {
      {}
    } else {
      stryCov_9fa48("411");
      return new Date(isoDate).toLocaleDateString();
    }
  }
}