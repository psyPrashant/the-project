import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { distinctUntilChanged, switchMap, of } from 'rxjs';

import { SkillsService } from '../skills.service';
import { SkillSearchResultResponse, SkillSummaryResponse } from '../skills.models';

@Component({
  selector: 'app-skills-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './skills-register.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsRegisterComponent {
  private readonly skillsService = inject(SkillsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly register = signal<SkillSummaryResponse[]>([]);
  protected readonly searchResults = signal<SkillSearchResultResponse[] | null>(null);
  protected readonly loading = signal(true);
  protected readonly searching = signal(false);

  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.skillsService.browseRegister()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: skills => {
          this.register.set(skills);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });

    this.searchControl.valueChanges.pipe(
      distinctUntilChanged(),
      switchMap(selected => {
        if (!selected) {
          this.searchResults.set(null);
          return of(null);
        }
        this.searching.set(true);
        return this.skillsService.searchBySkill(selected);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: results => {
        if (results !== null) {
          this.searchResults.set(results);
        }
        this.searching.set(false);
      },
      error: () => this.searching.set(false)
    });
  }
}
