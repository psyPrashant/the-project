import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

import { AuthService } from '../auth/auth.service';
import { DashboardService } from './dashboard.service';
import {
  ActionNeededItem,
  ActivityItem,
  ActivityType,
  DashboardResponse,
  SkillCoverageItem
} from './dashboard.models';
import { avatarColor, initials } from '../shared/avatar';

/**
 * Workforce overview dashboard (TSP-53). Aggregates pulse stats, follow-up actions, recent
 * activity, skill coverage, and a signed-in user summary. Uses signals + OnPush and delegates
 * data loading to DashboardService.
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly avatarColor = avatarColor;
  protected readonly initials = initials;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly dashboardData = signal<DashboardResponse | null>(null);
  protected readonly activityFilter = signal<ActivityType | 'all'>('all');
  protected readonly currentUser = this.authService.currentUser;

  protected readonly pulse = computed(() => this.dashboardData()?.workforcePulse ?? null);
  protected readonly actionNeeded = computed(() => this.dashboardData()?.actionNeeded ?? []);
  protected readonly skillCoverage = computed(() => this.dashboardData()?.skillCoverage ?? null);
  protected readonly me = computed(() => this.dashboardData()?.me ?? null);

  protected readonly filters: (ActivityType | 'all')[] = ['all', 'people', 'skills', 'interactions', 'tasks'];
  protected readonly math = Math;

  protected readonly filteredActivity = computed(() => {
    const all = this.dashboardData()?.recentActivity ?? [];
    const filter = this.activityFilter();
    if (filter === 'all') {
      return all;
    }
    return all.filter(item => item.type === filter);
  });

  ngOnInit(): void {
    this.dashboardService.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.dashboardData.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load dashboard. Please try again.');
          this.loading.set(false);
        }
      });
  }

  protected setFilter(filter: ActivityType | 'all'): void {
    this.activityFilter.set(filter);
  }

  protected trackByActivity(_index: number, item: ActivityItem): number {
    return item.targetEmployeeId;
  }

  protected trackByAction(_index: number, item: ActionNeededItem): number {
    return item.employeeId;
  }

  protected trackBySkill(_index: number, item: SkillCoverageItem): number {
    return item.skillId;
  }

  protected activityIcon(type: ActivityType): string {
    switch (type) {
      case 'people':
        return 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75';
      case 'skills':
        return 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z';
      case 'interactions':
        return 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z';
      case 'tasks':
        return 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11';
      case 'portfolio':
        return 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z';
    }
  }

  protected relativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days}d ago`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months}mo ago`;
    }
    return `${Math.floor(months / 12)}y ago`;
  }
}
