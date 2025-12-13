import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guard/auth.guard';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LeadScoringComponent } from './pages/lead-scoring/lead-scoring.component';
import { ClientFormComponent } from './pages/client-form/client-form.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
    {
    path: 'build',
    loadComponent: () => import('./pages/client-form/client-form.component').then(m => m.ClientFormComponent)
  },
  {
    path: 'who-we-are',
    loadComponent: () => import('./pages/who-we-are/who-we-are.component').then(m => m.WhoWeAreComponent) 
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin-layout/admin-layout.component')
      .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'lead-scoring',
        loadComponent: () => import('./pages/lead-scoring/lead-scoring.component')
          .then(m => m.LeadScoringComponent)
      }
    ]
  },
];