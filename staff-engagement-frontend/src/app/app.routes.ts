import { Routes } from '@angular/router';

import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home').then(m => m.HomeComponent)
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () => import('./employees/employee-list/employee-list').then(m => m.EmployeeListComponent)
  },
  {
    path: 'employees/new',
    canActivate: [authGuard],
    loadComponent: () => import('./employees/employee-form/employee-form').then(m => m.EmployeeFormComponent)
  },
  {
    path: 'employees/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./employees/employee-form/employee-form').then(m => m.EmployeeFormComponent)
  },
  {
    path: 'employees/:id/interactions',
    canActivate: [authGuard],
    loadComponent: () => import('./interactions/interaction-timeline/interaction-timeline').then(m => m.InteractionTimelineComponent)
  },
  {
    path: 'employees/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./employees/employee-profile/employee-profile').then(m => m.EmployeeProfileComponent)
  },
  {
    path: 'interactions/new',
    canActivate: [authGuard],
    loadComponent: () => import('./interactions/interaction-form/interaction-form').then(m => m.InteractionFormComponent)
  },
  {
    path: 'interactions/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./interactions/interaction-form/interaction-form').then(m => m.InteractionFormComponent)
  },
  {
    path: 'interactions/:id/create-task',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/create-task-from-interaction/create-task-from-interaction').then(m => m.CreateTaskFromInteractionComponent)
  },
  {
    path: 'tasks/mine',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/my-tasks/my-tasks').then(m => m.MyTasksComponent)
  },
  {
    path: 'tasks/new',
    canActivate: [authGuard],
    loadComponent: () => import('./tasks/create-task/create-task').then(m => m.CreateTaskComponent)
  }
];
