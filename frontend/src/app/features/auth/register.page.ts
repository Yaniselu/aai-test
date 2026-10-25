import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UtmService } from '../../core/services/utm.service';
import { AuthShellComponent } from './auth-shell.component';
import { PasswordFieldComponent } from './password-field.component';

/** Validator la nivel de grup: parolele trebuie sa coincida. */
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'aia-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, AuthShellComponent, PasswordFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-auth-shell
      [eyebrow]="'auth.register' | translate"
      [title]="'auth.registerTitle' | translate"
      [subtitle]="'auth.registerSubtitle' | translate"
    >
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="space-y-5">
        <div>
          <label class="aia-label" for="name">{{ 'auth.name' | translate }}</label>
          <input id="name" class="aia-input" formControlName="name" autocomplete="name" />
          @if (invalid('name')) {
            <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.name' | translate }}</p>
          }
        </div>

        <div>
          <label class="aia-label" for="reg-email">{{ 'auth.email' | translate }}</label>
          <input id="reg-email" type="email" class="aia-input" formControlName="email" autocomplete="email" />
          @if (invalid('email')) {
            <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.email' | translate }}</p>
          }
        </div>

        <div>
          <label class="aia-label" for="reg-phone">{{ 'auth.phone' | translate }}</label>
          <input id="reg-phone" type="tel" class="aia-input" formControlName="phone" autocomplete="tel" />
          @if (invalid('phone')) {
            <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.phone' | translate }}</p>
          }
        </div>

        <div>
          <label class="aia-label" for="reg-birth">{{ 'auth.birthDate' | translate }}</label>
          <input
            id="reg-birth"
            type="date"
            class="aia-input"
            formControlName="birthDate"
            [max]="maxBirthDate"
            autocomplete="bday"
          />
          @if (invalid('birthDate')) {
            <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">
              {{ 'auth.errors.birthDate' | translate }}
            </p>
          }
        </div>

        <aia-password-field
          [label]="'auth.password' | translate"
          inputId="reg-password"
          autocomplete="new-password"
          [control]="$any(form.controls.password)"
          [showStrength]="true"
          [errorMessage]="'auth.errors.passwordShort' | translate"
        />

        <aia-password-field
          [label]="'auth.confirmPassword' | translate"
          inputId="reg-password-confirm"
          autocomplete="new-password"
          [control]="$any(form.controls.confirmPassword)"
          [errorMessage]="'auth.errors.confirm' | translate"
        />

        @if (form.hasError('mismatch') && form.controls.confirmPassword.touched) {
          <p class="text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.mismatch' | translate }}</p>
        }

        <label class="flex items-start gap-3 text-xs" [style.color]="'var(--aia-text-muted)'">
          <input type="checkbox" formControlName="terms" class="mt-0.5 accent-[var(--aia-blood)]" />
          <span>
            {{ 'auth.termsAgree' | translate }}
            <a routerLink="/legal/termeni" class="underline hover:text-[var(--aia-cyan)]">
              {{ 'auth.termsLink' | translate }}</a
            >
            {{ 'auth.and' | translate }}
            <a routerLink="/legal/confidentialitate" class="underline hover:text-[var(--aia-cyan)]">
              {{ 'auth.privacyLink' | translate }}</a
            >.
          </span>
        </label>
        @if (invalid('terms')) {
          <p class="text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.terms' | translate }}</p>
        }

        <button type="submit" class="aia-btn aia-btn-primary w-full" [disabled]="loading()">
          {{ (loading() ? 'auth.creating' : 'auth.register') | translate }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm" [style.color]="'var(--aia-text-muted)'">
        {{ 'auth.hasAccount' | translate }}
        <a routerLink="/auth/login" class="ml-1 underline underline-offset-4 hover:text-[var(--aia-cyan)]">
          {{ 'auth.signInHere' | translate }}
        </a>
      </p>
    </aia-auth-shell>
  `
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly utm = inject(UtmService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);

  /** Nu acceptam date din viitor la data nasterii. */
  readonly maxBirthDate = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s().-]{9,20}$/)]],
      birthDate: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    },
    { validators: passwordsMatch }
  );

  invalid(control: string): boolean {
    const ctrl = this.form.get(control);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(this.t.instant('auth.errors.incomplete'), this.t.instant('auth.errors.checkFields'));
      return;
    }

    this.loading.set(true);
    const { name, email, phone, password, birthDate } = this.form.getRawValue();

    this.auth.register({ name, email, phone, password, birthDate, utm: this.utm.get() }).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/auth/pending'], { state: { fresh: true } });
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.toast.error('Email deja folosit', 'Exista deja un cont cu aceasta adresa.');
        }
      }
    });
  }
}
