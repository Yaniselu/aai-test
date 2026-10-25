import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { UtmService } from '../../core/services/utm.service';
import { ACADEMY } from '../../core/academy.data';
import { TranslatePipe } from '@ngx-translate/core';

/** Formular de contact/informatii, cu atribuire UTM atasata automat la trimitere. */
@Component({
  selector: 'aia-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" class="scroll-mt-24 py-28">
      <div class="aia-container grid gap-16 lg:grid-cols-2">
        <div>
          <p class="aia-eyebrow">{{ 'contact.firstStep' | translate }}</p>
          <h2 class="aia-section-title mt-5">{{ 'contact.freeTitle' | translate }}</h2>

          <ul class="mt-10 space-y-3">
            @for (point of points; track point) {
              <li class="flex items-center gap-3 text-sm" [style.color]="'var(--aia-text-muted)'">
                <span class="h-1.5 w-1.5 shrink-0 rounded-full" [style.backgroundColor]="'var(--aia-cyan)'"></span>
                {{ point | translate }}
              </li>
            }
          </ul>

          <a
            class="aia-btn aia-btn-ghost mt-10"
            [href]="academy.whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{{ 'contact.whatsappAlt' | translate }}</span>
          </a>
        </div>

        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="aia-card p-8"
          novalidate
          aria-labelledby="contact-form-title"
        >
          <h3 id="contact-form-title" class="font-display text-2xl">{{ 'contact.formTitle' | translate }}</h3>

          <div class="mt-7 space-y-5">
            <div>
              <label class="aia-label" for="c-name">{{ 'contact.name' | translate }}</label>
              <input id="c-name" class="aia-input" formControlName="name" autocomplete="name" />
              @if (invalid('name')) {
                <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.name' | translate }}</p>
              }
            </div>

            <div>
              <label class="aia-label" for="c-email">{{ 'contact.email' | translate }}</label>
              <input id="c-email" type="email" class="aia-input" formControlName="email" autocomplete="email" />
              @if (invalid('email')) {
                <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.email' | translate }}</p>
              }
            </div>

            <div>
              <label class="aia-label" for="c-phone">{{ 'contact.phone' | translate }}</label>
              <input id="c-phone" type="tel" class="aia-input" formControlName="phone" autocomplete="tel" />
              @if (invalid('phone')) {
                <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.phone' | translate }}</p>
              }
            </div>

            <div>
              <label class="aia-label" for="c-group">{{ 'contact.group' | translate }}</label>
              <select id="c-group" class="aia-input" formControlName="group">
                <option value="kickbox-copii">KickBox Copii (5 - 12 ani)</option>
                <option value="kickbox-adulti">KickBox Adulti (12+)</option>
                <option value="karate">Karate (avansat)</option>
              </select>
            </div>

            <div>
              <label class="aia-label" for="c-message">{{ 'contact.message' | translate }}</label>
              <textarea id="c-message" rows="3" class="aia-input resize-none" formControlName="message"></textarea>
            </div>

            <label class="flex items-start gap-3 text-xs" [style.color]="'var(--aia-text-muted)'">
              <input type="checkbox" formControlName="gdpr" class="mt-0.5 accent-[var(--aia-blood)]" />
              <span>
                {{ 'contact.gdpr' | translate }}
              </span>
            </label>
            @if (invalid('gdpr')) {
              <p class="text-xs" [style.color]="'var(--aia-blood-bright)'">{{ 'auth.errors.terms' | translate }}</p>
            }
          </div>

          <button type="submit" class="aia-btn aia-btn-primary mt-7 w-full" [disabled]="submitting()">
            {{ (submitting() ? 'contact.submitting' : 'contact.submit') | translate }}
          </button>
        </form>
      </div>
    </section>
  `
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly utm = inject(UtmService);

  readonly academy = ACADEMY;
  readonly submitting = signal(false);

  readonly points = [
    'contact.points.equipment',
    'contact.points.size',
    'contact.points.noFee',
    'contact.points.platform'
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s().-]{9,20}$/)]],
    group: ['kickbox-copii', Validators.required],
    message: [''],
    gdpr: [false, Validators.requiredTrue]
  });

  invalid(control: string): boolean {
    const ctrl = this.form.get(control);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Formular incomplet', 'Verifica campurile marcate cu rosu.');
      return;
    }

    this.submitting.set(true);
    // Atribuirea campaniei calatoreste cu lead-ul, nu se pierde la navigare.
    const payload = { ...this.form.getRawValue(), utm: this.utm.get() };

    this.api.post('/contact', payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.form.reset({ group: 'kickbox-copii', gdpr: false });
        this.toast.success('Solicitare trimisa', 'Te contactam in maximum 24 de ore.');
      },
      error: () => this.submitting.set(false)
    });
  }
}
