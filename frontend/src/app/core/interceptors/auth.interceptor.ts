import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Atașează JWT-ul și traduce erorile de autorizare:
 *  401 -> sesiune expirată, 403 cu cod PENDING_APPROVAL -> cont neaprobat.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  const token = auth.token();
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.isLoggedIn()) {
        auth.logout(false);
        toast.warning('Sesiune expirată', 'Autentifică-te din nou pentru a continua.');
        void router.navigate(['/auth/login']);
      }

      if (error.status === 403 && error.error?.code === 'PENDING_APPROVAL') {
        void router.navigate(['/auth/pending']);
      }

      return throwError(() => error);
    })
  );
};
