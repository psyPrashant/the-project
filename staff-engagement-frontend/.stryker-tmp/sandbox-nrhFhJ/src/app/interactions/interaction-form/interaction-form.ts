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
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../employees/employee.service';
import { EmployeeProfileResponse } from '../../employees/employee.models';
import { InteractionService } from '../interaction.service';
import { InteractionResponse, InteractionType } from '../interaction.models';
interface InteractionForm {
  subjectId: FormControl<number | null>;
  type: FormControl<InteractionType>;
  date: FormControl<string>;
  note: FormControl<string>;
}
@Component({
  selector: 'app-interaction-form',
  imports: [ReactiveFormsModule],
  templateUrl: './interaction-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractionFormComponent {
  private readonly interactionService = inject(InteractionService);
  private readonly employeeService = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly employees = signal<EmployeeProfileResponse[]>(stryMutAct_9fa48("191") ? ["Stryker was here"] : (stryCov_9fa48("191"), []));
  protected readonly loadingEmployees = signal(stryMutAct_9fa48("192") ? false : (stryCov_9fa48("192"), true));
  protected readonly loadingInteraction = signal(stryMutAct_9fa48("193") ? true : (stryCov_9fa48("193"), false));
  protected readonly submitting = signal(stryMutAct_9fa48("194") ? true : (stryCov_9fa48("194"), false));
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly interactionTypes = Object.values(InteractionType);
  protected readonly interactionId = signal<number | undefined>(this.route.snapshot.paramMap.get(stryMutAct_9fa48("195") ? "" : (stryCov_9fa48("195"), 'id')) ? Number(this.route.snapshot.paramMap.get(stryMutAct_9fa48("196") ? "" : (stryCov_9fa48("196"), 'id'))) : undefined);
  protected readonly subjectIdParam = signal<number | undefined>(this.route.snapshot.queryParamMap.get(stryMutAct_9fa48("197") ? "" : (stryCov_9fa48("197"), 'subjectId')) ? Number(this.route.snapshot.queryParamMap.get(stryMutAct_9fa48("198") ? "" : (stryCov_9fa48("198"), 'subjectId'))) : undefined);
  protected readonly isEditMode = computed(stryMutAct_9fa48("199") ? () => undefined : (stryCov_9fa48("199"), () => stryMutAct_9fa48("202") ? this.interactionId() === undefined : stryMutAct_9fa48("201") ? false : stryMutAct_9fa48("200") ? true : (stryCov_9fa48("200", "201", "202"), this.interactionId() !== undefined)));
  protected readonly form = new FormGroup<InteractionForm>(stryMutAct_9fa48("203") ? {} : (stryCov_9fa48("203"), {
    subjectId: new FormControl<number | null>(null, stryMutAct_9fa48("204") ? {} : (stryCov_9fa48("204"), {
      nonNullable: stryMutAct_9fa48("205") ? true : (stryCov_9fa48("205"), false),
      validators: stryMutAct_9fa48("206") ? [] : (stryCov_9fa48("206"), [Validators.required])
    })),
    type: new FormControl<InteractionType>(InteractionType.NOTE, stryMutAct_9fa48("207") ? {} : (stryCov_9fa48("207"), {
      nonNullable: stryMutAct_9fa48("208") ? false : (stryCov_9fa48("208"), true),
      validators: stryMutAct_9fa48("209") ? [] : (stryCov_9fa48("209"), [Validators.required])
    })),
    date: new FormControl<string>(stryMutAct_9fa48("210") ? "Stryker was here!" : (stryCov_9fa48("210"), ''), stryMutAct_9fa48("211") ? {} : (stryCov_9fa48("211"), {
      nonNullable: stryMutAct_9fa48("212") ? false : (stryCov_9fa48("212"), true),
      validators: stryMutAct_9fa48("213") ? [] : (stryCov_9fa48("213"), [Validators.required])
    })),
    note: new FormControl(stryMutAct_9fa48("214") ? "Stryker was here!" : (stryCov_9fa48("214"), ''), stryMutAct_9fa48("215") ? {} : (stryCov_9fa48("215"), {
      nonNullable: stryMutAct_9fa48("216") ? false : (stryCov_9fa48("216"), true),
      validators: stryMutAct_9fa48("217") ? [] : (stryCov_9fa48("217"), [Validators.required])
    }))
  }));
  constructor() {
    if (stryMutAct_9fa48("218")) {
      {}
    } else {
      stryCov_9fa48("218");
      const subjectId = this.subjectIdParam();
      if (stryMutAct_9fa48("220") ? false : stryMutAct_9fa48("219") ? true : (stryCov_9fa48("219", "220"), this.isEditMode())) {
        if (stryMutAct_9fa48("221")) {
          {}
        } else {
          stryCov_9fa48("221");
          this.loadingInteraction.set(stryMutAct_9fa48("222") ? false : (stryCov_9fa48("222"), true));
          this.form.disable();
          const id = this.interactionId();
          if (stryMutAct_9fa48("225") ? id === undefined : stryMutAct_9fa48("224") ? false : stryMutAct_9fa48("223") ? true : (stryCov_9fa48("223", "224", "225"), id !== undefined)) {
            if (stryMutAct_9fa48("226")) {
              {}
            } else {
              stryCov_9fa48("226");
              this.interactionService.findById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("227") ? {} : (stryCov_9fa48("227"), {
                next: interaction => {
                  if (stryMutAct_9fa48("228")) {
                    {}
                  } else {
                    stryCov_9fa48("228");
                    this.patchForm(interaction);
                    this.loadingInteraction.set(stryMutAct_9fa48("229") ? true : (stryCov_9fa48("229"), false));
                    this.form.enable();
                    this.form.controls.subjectId.disable();
                  }
                },
                error: () => {
                  if (stryMutAct_9fa48("230")) {
                    {}
                  } else {
                    stryCov_9fa48("230");
                    this.loadingInteraction.set(stryMutAct_9fa48("231") ? true : (stryCov_9fa48("231"), false));
                    this.form.enable();
                    this.errorMessage.set(stryMutAct_9fa48("232") ? "" : (stryCov_9fa48("232"), 'Failed to load interaction.'));
                  }
                }
              }));
            }
          }
        }
      } else {
        if (stryMutAct_9fa48("233")) {
          {}
        } else {
          stryCov_9fa48("233");
          if (stryMutAct_9fa48("236") ? subjectId === undefined : stryMutAct_9fa48("235") ? false : stryMutAct_9fa48("234") ? true : (stryCov_9fa48("234", "235", "236"), subjectId !== undefined)) {
            if (stryMutAct_9fa48("237")) {
              {}
            } else {
              stryCov_9fa48("237");
              this.form.controls.subjectId.setValue(subjectId);
              this.form.controls.subjectId.disable();
            }
          }
          afterNextRender(() => {
            if (stryMutAct_9fa48("238")) {
              {}
            } else {
              stryCov_9fa48("238");
              this.form.controls.date.setValue(this.formatDate(new Date()));
            }
          });
        }
      }
      this.employeeService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("239") ? {} : (stryCov_9fa48("239"), {
        next: list => {
          if (stryMutAct_9fa48("240")) {
            {}
          } else {
            stryCov_9fa48("240");
            this.employees.set(list);
            this.loadingEmployees.set(stryMutAct_9fa48("241") ? true : (stryCov_9fa48("241"), false));
          }
        },
        error: () => {
          if (stryMutAct_9fa48("242")) {
            {}
          } else {
            stryCov_9fa48("242");
            this.loadingEmployees.set(stryMutAct_9fa48("243") ? true : (stryCov_9fa48("243"), false));
            this.errorMessage.set(stryMutAct_9fa48("244") ? "" : (stryCov_9fa48("244"), 'Failed to load employees.'));
          }
        }
      }));
    }
  }
  private patchForm(interaction: InteractionResponse): void {
    if (stryMutAct_9fa48("245")) {
      {}
    } else {
      stryCov_9fa48("245");
      this.form.patchValue(stryMutAct_9fa48("246") ? {} : (stryCov_9fa48("246"), {
        subjectId: interaction.subject.id,
        type: interaction.type,
        date: interaction.date,
        note: interaction.note
      }));
    }
  }
  protected onSubmit(): void {
    if (stryMutAct_9fa48("247")) {
      {}
    } else {
      stryCov_9fa48("247");
      if (stryMutAct_9fa48("249") ? false : stryMutAct_9fa48("248") ? true : (stryCov_9fa48("248", "249"), this.form.invalid)) {
        if (stryMutAct_9fa48("250")) {
          {}
        } else {
          stryCov_9fa48("250");
          this.form.markAllAsTouched();
          return;
        }
      }
      const rawValue = this.form.getRawValue();
      if (stryMutAct_9fa48("253") ? rawValue.subjectId === null && rawValue.subjectId === undefined : stryMutAct_9fa48("252") ? false : stryMutAct_9fa48("251") ? true : (stryCov_9fa48("251", "252", "253"), (stryMutAct_9fa48("255") ? rawValue.subjectId !== null : stryMutAct_9fa48("254") ? false : (stryCov_9fa48("254", "255"), rawValue.subjectId === null)) || (stryMutAct_9fa48("257") ? rawValue.subjectId !== undefined : stryMutAct_9fa48("256") ? false : (stryCov_9fa48("256", "257"), rawValue.subjectId === undefined)))) {
        if (stryMutAct_9fa48("258")) {
          {}
        } else {
          stryCov_9fa48("258");
          return;
        }
      }
      this.submitting.set(stryMutAct_9fa48("259") ? false : (stryCov_9fa48("259"), true));
      this.errorMessage.set(null);
      const request = stryMutAct_9fa48("260") ? {} : (stryCov_9fa48("260"), {
        subjectId: rawValue.subjectId,
        type: rawValue.type,
        date: rawValue.date,
        note: rawValue.note
      });
      const id = this.interactionId();
      const operation = (stryMutAct_9fa48("263") ? id === undefined : stryMutAct_9fa48("262") ? false : stryMutAct_9fa48("261") ? true : (stryCov_9fa48("261", "262", "263"), id !== undefined)) ? this.interactionService.update(id, request) : this.interactionService.create(request);
      operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("264") ? {} : (stryCov_9fa48("264"), {
        next: interaction => {
          if (stryMutAct_9fa48("265")) {
            {}
          } else {
            stryCov_9fa48("265");
            this.submitting.set(stryMutAct_9fa48("266") ? true : (stryCov_9fa48("266"), false));
            void this.router.navigate(stryMutAct_9fa48("267") ? [] : (stryCov_9fa48("267"), [stryMutAct_9fa48("268") ? "" : (stryCov_9fa48("268"), '/employees'), interaction.subject.id, stryMutAct_9fa48("269") ? "" : (stryCov_9fa48("269"), 'interactions')]));
          }
        },
        error: err => {
          if (stryMutAct_9fa48("270")) {
            {}
          } else {
            stryCov_9fa48("270");
            this.submitting.set(stryMutAct_9fa48("271") ? true : (stryCov_9fa48("271"), false));
            this.errorMessage.set(this.extractErrorMessage(err));
          }
        }
      }));
    }
  }
  protected cancel(): void {
    if (stryMutAct_9fa48("272")) {
      {}
    } else {
      stryCov_9fa48("272");
      const rawValue = this.form.getRawValue();
      const subjectId = stryMutAct_9fa48("273") ? rawValue.subjectId && this.subjectIdParam() : (stryCov_9fa48("273"), rawValue.subjectId ?? this.subjectIdParam());
      void this.router.navigate((stryMutAct_9fa48("276") ? subjectId !== undefined || subjectId !== null : stryMutAct_9fa48("275") ? false : stryMutAct_9fa48("274") ? true : (stryCov_9fa48("274", "275", "276"), (stryMutAct_9fa48("278") ? subjectId === undefined : stryMutAct_9fa48("277") ? true : (stryCov_9fa48("277", "278"), subjectId !== undefined)) && (stryMutAct_9fa48("280") ? subjectId === null : stryMutAct_9fa48("279") ? true : (stryCov_9fa48("279", "280"), subjectId !== null)))) ? stryMutAct_9fa48("281") ? [] : (stryCov_9fa48("281"), [stryMutAct_9fa48("282") ? "" : (stryCov_9fa48("282"), '/employees'), subjectId, stryMutAct_9fa48("283") ? "" : (stryCov_9fa48("283"), 'interactions')]) : stryMutAct_9fa48("284") ? [] : (stryCov_9fa48("284"), [stryMutAct_9fa48("285") ? "" : (stryCov_9fa48("285"), '/employees')]));
    }
  }
  private formatDate(date: Date): string {
    if (stryMutAct_9fa48("286")) {
      {}
    } else {
      stryCov_9fa48("286");
      const year = date.getFullYear();
      const month = String(stryMutAct_9fa48("287") ? date.getMonth() - 1 : (stryCov_9fa48("287"), date.getMonth() + 1)).padStart(2, stryMutAct_9fa48("288") ? "" : (stryCov_9fa48("288"), '0'));
      const day = String(date.getDate()).padStart(2, stryMutAct_9fa48("289") ? "" : (stryCov_9fa48("289"), '0'));
      return stryMutAct_9fa48("290") ? `` : (stryCov_9fa48("290"), `${year}-${month}-${day}`);
    }
  }
  private extractErrorMessage(err: unknown): string {
    if (stryMutAct_9fa48("291")) {
      {}
    } else {
      stryCov_9fa48("291");
      if (stryMutAct_9fa48("293") ? false : stryMutAct_9fa48("292") ? true : (stryCov_9fa48("292", "293"), err instanceof Error)) {
        if (stryMutAct_9fa48("294")) {
          {}
        } else {
          stryCov_9fa48("294");
          return err.message;
        }
      }
      if (stryMutAct_9fa48("297") ? typeof err === 'object' && err !== null && 'error' in err || typeof err.error === 'string' : stryMutAct_9fa48("296") ? false : stryMutAct_9fa48("295") ? true : (stryCov_9fa48("295", "296", "297"), (stryMutAct_9fa48("299") ? typeof err === 'object' && err !== null || 'error' in err : stryMutAct_9fa48("298") ? true : (stryCov_9fa48("298", "299"), (stryMutAct_9fa48("301") ? typeof err === 'object' || err !== null : stryMutAct_9fa48("300") ? true : (stryCov_9fa48("300", "301"), (stryMutAct_9fa48("303") ? typeof err !== 'object' : stryMutAct_9fa48("302") ? true : (stryCov_9fa48("302", "303"), typeof err === (stryMutAct_9fa48("304") ? "" : (stryCov_9fa48("304"), 'object')))) && (stryMutAct_9fa48("306") ? err === null : stryMutAct_9fa48("305") ? true : (stryCov_9fa48("305", "306"), err !== null)))) && (stryMutAct_9fa48("307") ? "" : (stryCov_9fa48("307"), 'error')) in err)) && (stryMutAct_9fa48("309") ? typeof err.error !== 'string' : stryMutAct_9fa48("308") ? true : (stryCov_9fa48("308", "309"), typeof err.error === (stryMutAct_9fa48("310") ? "" : (stryCov_9fa48("310"), 'string')))))) {
        if (stryMutAct_9fa48("311")) {
          {}
        } else {
          stryCov_9fa48("311");
          return err.error;
        }
      }
      if (stryMutAct_9fa48("314") ? typeof err === 'object' && err !== null && 'message' in err || typeof err.message === 'string' : stryMutAct_9fa48("313") ? false : stryMutAct_9fa48("312") ? true : (stryCov_9fa48("312", "313", "314"), (stryMutAct_9fa48("316") ? typeof err === 'object' && err !== null || 'message' in err : stryMutAct_9fa48("315") ? true : (stryCov_9fa48("315", "316"), (stryMutAct_9fa48("318") ? typeof err === 'object' || err !== null : stryMutAct_9fa48("317") ? true : (stryCov_9fa48("317", "318"), (stryMutAct_9fa48("320") ? typeof err !== 'object' : stryMutAct_9fa48("319") ? true : (stryCov_9fa48("319", "320"), typeof err === (stryMutAct_9fa48("321") ? "" : (stryCov_9fa48("321"), 'object')))) && (stryMutAct_9fa48("323") ? err === null : stryMutAct_9fa48("322") ? true : (stryCov_9fa48("322", "323"), err !== null)))) && (stryMutAct_9fa48("324") ? "" : (stryCov_9fa48("324"), 'message')) in err)) && (stryMutAct_9fa48("326") ? typeof err.message !== 'string' : stryMutAct_9fa48("325") ? true : (stryCov_9fa48("325", "326"), typeof err.message === (stryMutAct_9fa48("327") ? "" : (stryCov_9fa48("327"), 'string')))))) {
        if (stryMutAct_9fa48("328")) {
          {}
        } else {
          stryCov_9fa48("328");
          return err.message;
        }
      }
      return stryMutAct_9fa48("329") ? "" : (stryCov_9fa48("329"), 'Failed to save interaction. Please try again.');
    }
  }
}