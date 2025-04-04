// app.routes.ts
import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { TasksComponent } from './features/tasks/tasks.component';
import { AuthGuard } from './core/guards/auth.guard';
import { KanbanComponent } from './features/kanban/kanban.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: LandingPageComponent },
      { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
      { path: 'signup', loadComponent: () => import('./pages/sign-up/sign-up.component').then(m => m.SignUpComponent) },
    ],
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'tasks', component: TasksComponent },
      { path: 'kanban', component: KanbanComponent },
      { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'profile',loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
