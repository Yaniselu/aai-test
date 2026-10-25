import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Role, User } from '../models/models';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate: string;
  /** Parametri UTM capturați la înscriere pentru atribuirea campaniilor. */
  utm?: Record<string, string>;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  private readonly _token = signal<string | null>(this.storage.get(environment.storageKeys.token));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isApproved = computed(() => this._user()?.approved === true);
  readonly isTrainer = computed(() => this.hasAnyRole('ROLE_TRAINER', 'ROLE_ADMIN'));
  readonly isAdmin = computed(() => this.hasAnyRole('ROLE_ADMIN'));

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>('/auth/login', { email, password })
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: RegisterPayload): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/register', payload);
  }

  /** Reîncarcă profilul curent — apelat la bootstrap dacă există token salvat. */
  loadProfile(): Observable<User> {
    return this.api.get<User>('/users/me').pipe(tap((user) => this._user.set(user)));
  }

  logout(redirect = true): void {
    this._token.set(null);
    this._user.set(null);
    this.storage.remove(environment.storageKeys.token);
    if (redirect) void this.router.navigate(['/']);
  }

  hasAnyRole(...roles: Role[]): boolean {
    const role = this._user()?.role;
    return !!role && roles.includes(role);
  }

  /** Actualizează local utilizatorul (după claim de recompensă, spin etc.). */
  patchUser(patch: Partial<User>): void {
    this._user.update((u) => (u ? { ...u, ...patch } : u));
  }

  private persist(res: AuthResponse): void {
    this._token.set(res.token);
    this._user.set(res.user);
    this.storage.set(environment.storageKeys.token, res.token);
  }
}
