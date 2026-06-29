import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';

/**
 * "Engage" routing (TSP-44). Authenticated screens are children of the app shell. Dashboard and
 * Skills Register resolve to the coming-soon placeholder (no backend yet). Legacy paths redirect
 * into the consolidated routes so old links keep working.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/app-shell/app-shell').then(m => m.AppShellComponent),
    children: [
      { path: '', redirectTo: 'people', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./shell/coming-soon/coming-soon').then(m => m.ComingSoonComponent),
        data: { screen: 'My Dashboard' }
      },
      {
        path: 'people',
        loadComponent: () =>
          import('./employees/employee-list/employee-list').then(m => m.EmployeeListComponent)
      },
      {
        path: 'people/:id',
        loadComponent: () =>
          import('./employees/employee-profile/employee-profile').then(m => m.EmployeeProfileComponent)
      },
      {
        path: 'skills',
        loadComponent: () => import('./shell/coming-soon/coming-soon').then(m => m.ComingSoonComponent),
        data: { screen: 'Skills Register' }
      },
      {
        path: 'tasks',
        loadComponent: () => import('./tasks/my-tasks/my-tasks').then(m => m.MyTasksComponent)
      },
      {
        path: 'tasks/new',
        loadComponent: () => import('./tasks/create-task/create-task').then(m => m.CreateTaskComponent)
      },
      {
        path: 'interactions/new',
        loadComponent: () =>
          import('./interactions/interaction-form/interaction-form').then(m => m.InteractionFormComponent)
      },
      {
        path: 'interactions/:id/edit',
        loadComponent: () =>
          import('./interactions/interaction-form/interaction-form').then(m => m.InteractionFormComponent)
      },
      {
        path: 'interactions/:id/create-task',
        loadComponent: () =>
          import('./tasks/create-task-from-interaction/create-task-from-interaction').then(
            m => m.CreateTaskFromInteractionComponent
          )
      },

      // Legacy redirects (pre-reskin routes).
      { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'employees', redirectTo: 'people', pathMatch: 'full' },
      { path: 'tasks/mine', redirectTo: 'tasks', pathMatch: 'full' },
      { path: 'employees/:id/interactions', redirectTo: 'people/:id', pathMatch: 'full' },
      { path: 'employees/:id/portfolio', redirectTo: 'people/:id', pathMatch: 'full' },
      { path: 'employees/:id', redirectTo: 'people/:id', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
