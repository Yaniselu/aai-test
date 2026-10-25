import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, trainerGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    title: 'Academia Ion Andrei | Disciplină. Forță. Respect. Victorie.'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
        title: 'Autentificare | Academia Ion Andrei'
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register.page').then((m) => m.RegisterPage),
        title: 'Înscriere | Academia Ion Andrei'
      },
      {
        path: 'pending',
        loadComponent: () => import('./features/auth/pending.page').then((m) => m.PendingPage),
        title: 'Cont în verificare | Academia Ion Andrei'
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.layout').then((m) => m.DashboardLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/profile.page').then((m) => m.ProfilePage),
        title: 'Profilul meu | Academia Ion Andrei'
      },
      {
        path: 'battlepass',
        loadComponent: () =>
          import('./features/dashboard/battle-pass/battle-pass.page').then((m) => m.BattlePassPage),
        title: 'Battle Pass | Academia Ion Andrei'
      },
      {
        path: 'roata',
        loadComponent: () => import('./features/dashboard/wheel/wheel.page').then((m) => m.WheelPage),
        title: 'Învârte-l pe Birtu | Academia Ion Andrei'
      },
      {
        path: 'stories',
        loadComponent: () => import('./features/dashboard/stories.page').then((m) => m.StoriesPage),
        title: 'Story-uri | Academia Ion Andrei'
      },
      {
        path: 'competitii',
        loadComponent: () => import('./features/dashboard/competitions.page').then((m) => m.CompetitionsPage),
        title: 'Calendar competiții | Academia Ion Andrei'
      },
      {
        path: 'program',
        loadComponent: () =>
          import('./features/dashboard/schedule.page').then((m) => m.SchedulePage),
        title: 'Program | Academia Ion Andrei'
      }
    ]
  },
  {
    path: 'antrenor',
    canActivate: [trainerGuard],
    children: [
      {
        path: 'prezenta',
        loadComponent: () => import('./features/trainer/attendance.page').then((m) => m.AttendancePage),
        title: 'Prezență | Panou antrenor'
      },
      {
        path: 'competitii',
        loadComponent: () =>
          import('./features/trainer/manage-competitions.page').then((m) => m.ManageCompetitionsPage),
        title: 'Gestionare competiții | Panou antrenor'
      },
      {
        path: 'aprobari',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/trainer/approvals.page').then((m) => m.ApprovalsPage),
        title: 'Aprobare conturi | Panou admin'
      },
      { path: '', pathMatch: 'full', redirectTo: 'prezenta' }
    ]
  },
  {
    path: 'legal',
    children: [
      {
        path: 'confidentialitate',
        loadComponent: () => import('./features/legal/privacy.page').then((m) => m.PrivacyPage),
        title: 'Politică de confidențialitate'
      },
      {
        path: 'termeni',
        loadComponent: () => import('./features/legal/terms.page').then((m) => m.TermsPage),
        title: 'Termeni și condiții'
      },
      {
        path: 'cookies',
        loadComponent: () => import('./features/legal/cookies.page').then((m) => m.CookiesPage),
        title: 'Politica de cookie-uri'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
    title: '404 | Academia Ion Andrei'
  }
];
