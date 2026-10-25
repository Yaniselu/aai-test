import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/** Afișează un toast pentru erorile care nu sunt tratate local de componente. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const silent = req.headers.has('X-Silent-Error');
      if (!silent && error.status !== 401 && error.status !== 403) {
        const message =
          error.error?.message ??
          (error.status === 0
            ? 'Serverul nu răspunde. Verifică conexiunea la internet.'
            : 'A apărut o eroare neașteptată.');
        toast.error(`Eroare ${error.status || ''}`.trim(), message);
      }
      return throwError(() => error);
    })
  );
};
