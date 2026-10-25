import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/** Necesită sesiune activă ȘI cont aprobat de administrator. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth/login'], { queryParams: { redirect: state.url } });
  }
  if (!auth.isApproved()) {
    return router.createUrlTree(['/auth/pending']);
  }
  return true;
};

/** Doar antrenori și administratori. */
export const trainerGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const base = authGuard(route, state);
  if (base !== true) return base;

  if (!auth.isTrainer()) {
    toast.error('Acces restricționat', 'Această secțiune este rezervată antrenorilor.');
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};

/** Doar administratori. */
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const base = authGuard(route, state);
  if (base !== true) return base;

  return auth.isAdmin() ? true : router.createUrlTree(['/dashboard']);
};

/** Blochează accesul la login/register pentru utilizatorii deja autentificați. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree(['/dashboard']) : true;
};
