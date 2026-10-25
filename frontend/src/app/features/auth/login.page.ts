import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthShellComponent } from './auth-shell.component';
import { PasswordFieldComponent } from './password-field.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'aia-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, AuthShellComponent, PasswordFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-auth-shell
      [eyebrow]="'auth.login' | translate"
      [title]="'auth.loginTitle' | translate"
      [subtitle]="'auth.loginSubtitle' | translate"
    >
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">
        <div>
          <label class="aia-label" for="email">{{ 'auth.email' | translate }}</label>
          <input
            id="email"
            type="email"
            class="aia-input"
            formControlName="email"
            autocomplete="email"
            [attr.aria-invalid]="invalid('email')"
          />
          @if (invalid('email')) {
            <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.email' | translate }}</p>
          }
        </div>

        <aia-password-field
          [label]="'auth.password' | translate"
          inputId="password"
          autocomplete="current-password"
          [control]="$any(form.controls.password)"
          [errorMessage]="'auth.errors.password' | translate"
        />

        <button type="submit" class="aia-btn aia-btn-primary w-full" [disabled]="loading()">
          {{ (loading() ? 'auth.checking' : 'auth.login') | translate }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm" [style.color]="'var(--aia-text-muted)'">
        {{ 'auth.noAccount' | translate }}
        <a routerLink="/auth/register" class="ml-1 underline underline-offset-4 hover:text-[var(--aia-cyan)]">
          {{ 'auth.signUpHere' | translate }}
        </a>
      </p>
    </aia-auth-shell>
  `
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  invalid(control: string): boolean {
    const ctrl = this.form.get(control);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!res.user.approved) {
          // Contul exista, dar adminul nu l-a validat inca.
          void this.router.navigate(['/auth/pending']);
          return;
        }
        this.toast.success('Bun venit inapoi, ' + res.user.name.split(' ')[0] + '!');
        const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/dashboard';
        void this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.toast.error('Date incorecte', 'Emailul sau parola nu se potrivesc.');
        }
      }
    });
  }
}
