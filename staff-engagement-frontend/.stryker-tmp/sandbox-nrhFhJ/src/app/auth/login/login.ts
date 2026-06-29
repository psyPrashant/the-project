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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly submitting = signal(stryMutAct_9fa48("42") ? true : (stryCov_9fa48("42"), false));
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group(stryMutAct_9fa48("43") ? {} : (stryCov_9fa48("43"), {
    email: stryMutAct_9fa48("44") ? [] : (stryCov_9fa48("44"), [stryMutAct_9fa48("45") ? "Stryker was here!" : (stryCov_9fa48("45"), ''), stryMutAct_9fa48("46") ? [] : (stryCov_9fa48("46"), [Validators.required, Validators.email])]),
    password: stryMutAct_9fa48("47") ? [] : (stryCov_9fa48("47"), [stryMutAct_9fa48("48") ? "Stryker was here!" : (stryCov_9fa48("48"), ''), stryMutAct_9fa48("49") ? [] : (stryCov_9fa48("49"), [Validators.required, Validators.minLength(6)])])
  }));
  protected onSubmit(): void {
    if (stryMutAct_9fa48("50")) {
      {}
    } else {
      stryCov_9fa48("50");
      if (stryMutAct_9fa48("52") ? false : stryMutAct_9fa48("51") ? true : (stryCov_9fa48("51", "52"), this.form.invalid)) {
        if (stryMutAct_9fa48("53")) {
          {}
        } else {
          stryCov_9fa48("53");
          this.form.markAllAsTouched();
          return;
        }
      }
      this.submitting.set(stryMutAct_9fa48("54") ? false : (stryCov_9fa48("54"), true));
      this.errorMessage.set(null);
      this.authService.login(this.form.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stryMutAct_9fa48("55") ? {} : (stryCov_9fa48("55"), {
        next: () => {
          if (stryMutAct_9fa48("56")) {
            {}
          } else {
            stryCov_9fa48("56");
            const redirect = stryMutAct_9fa48("57") ? this.route.snapshot.queryParamMap.get('redirect') && '/home' : (stryCov_9fa48("57"), this.route.snapshot.queryParamMap.get(stryMutAct_9fa48("58") ? "" : (stryCov_9fa48("58"), 'redirect')) ?? (stryMutAct_9fa48("59") ? "" : (stryCov_9fa48("59"), '/home')));
            void this.router.navigateByUrl(redirect);
          }
        },
        error: () => {
          if (stryMutAct_9fa48("60")) {
            {}
          } else {
            stryCov_9fa48("60");
            this.errorMessage.set(stryMutAct_9fa48("61") ? "" : (stryCov_9fa48("61"), 'Invalid email or password.'));
            this.submitting.set(stryMutAct_9fa48("62") ? true : (stryCov_9fa48("62"), false));
          }
        }
      }));
    }
  }
}