import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Wrapper subtire peste HttpClient care prefixeaza automat baza API-ului.
 *
 * Cand `apiUrl` este gol (build pentru GitHub Pages, unde nu exista backend),
 * fiecare apel esueaza imediat si controlat, cu codul NO_BACKEND. Fara asta,
 * cererile ar pleca spre cai relative, ar primi index.html cu status 200 si
 * aplicatia ar incerca sa parseze HTML ca JSON.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  /** Fals pe build-ul static: zona de cont nu are unde sa ceara date. */
  readonly available = !!environment.apiUrl;

  private unavailable<T>(): Observable<T> {
    return throwError(() => ({ status: 0, code: 'NO_BACKEND', message: 'Backend indisponibil' }));
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    if (!this.available) return this.unavailable<T>();
    return this.http.get<T>(`${this.base}${path}`, { params: this.toParams(params) });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    if (!this.available) return this.unavailable<T>();
    return this.http.post<T>(`${this.base}${path}`, body ?? {});
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    if (!this.available) return this.unavailable<T>();
    return this.http.put<T>(`${this.base}${path}`, body ?? {});
  }

  delete<T>(path: string): Observable<T> {
    if (!this.available) return this.unavailable<T>();
    return this.http.delete<T>(`${this.base}${path}`);
  }

  upload<T>(path: string, form: FormData): Observable<T> {
    if (!this.available) return this.unavailable<T>();
    return this.http.post<T>(`${this.base}${path}`, form);
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
