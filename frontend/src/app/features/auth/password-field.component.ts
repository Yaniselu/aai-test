import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../../shared/icons/icon.component';

/**
 * Camp de parola cu comutator de vizibilitate si indicator de putere.
 *
 * Puterea se calculeaza dintr-un semnal alimentat de `valueChanges`. Varianta
 * anterioara citea `control().value` direct intr-un `computed`, iar semnalele
 * nu urmaresc schimbarile unui FormControl: bara ramanea inghetata pe prima
 * valoare, indiferent ce tastai.
 */
@Component({
  selector: 'aia-password-field',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label class="aia-label" [attr.for]="inputId()">{{ label() }}</label>

      <div class="relative">
        <input
          [id]="inputId()"
          [type]="visible() ? 'text' : 'password'"
          class="aia-input pr-12"
          [formControl]="control()"
          [attr.autocomplete]="autocomplete()"
          [attr.aria-invalid]="showError()"
          [attr.aria-describedby]="showStrength() ? inputId() + '-strength' : null"
        />

        <button
          type="button"
          class="absolute inset-y-0 right-0 grid w-12 place-items-center opacity-60 transition-opacity hover:opacity-100"
          (click)="visible.set(!visible())"
          [attr.aria-label]="(visible() ? 'auth.hidePassword' : 'auth.showPassword') | translate"
          [attr.aria-pressed]="visible()"
          tabindex="-1"
        >
          <aia-icon [name]="visible() ? 'eye-off' : 'eye'" [size]="18" />
        </button>
      </div>

      @if (showError()) {
        <p class="mt-1.5 text-xs" [style.color]="'var(--aia-blood-bright)'">{{ errorMessage() }}</p>
      }

      @if (showStrength() && value().length > 0) {
        <div [id]="inputId() + '-strength'" class="mt-3">
          <div class="flex gap-1.5">
            @for (bar of bars; track bar) {
              <span
                class="h-1 flex-1 rounded-full transition-colors duration-300"
                [style.backgroundColor]="bar < strength() ? strengthColor() : 'var(--aia-border)'"
              ></span>
            }
          </div>
          <p class="mt-2 text-xs" [style.color]="'var(--aia-text-muted)'">
            {{ 'auth.strength.label' | translate }}:
            <span [style.color]="strengthColor()">{{ strengthLabelKey() | translate }}</span>
          </p>
        </div>
      }
    </div>
  `
})
export class PasswordFieldComponent {
  readonly control = input.required<FormControl<string>>();
  readonly label = input('Parola');
  readonly inputId = input('password');
  readonly autocomplete = input('current-password');
  readonly errorMessage = input('Parola este obligatorie.');
  readonly showStrength = input(false);

  readonly visible = signal(false);
  readonly bars = [0, 1, 2, 3];

  /** Valoarea curenta, ca semnal: sursa reala pentru indicatorul de putere. */
  readonly value = signal('');
  /** Reevaluat la fiecare schimbare de stare a controlului (touched/dirty). */
  private readonly touched = signal(false);

  constructor() {
    effect((onCleanup) => {
      const ctrl = this.control();
      this.value.set(ctrl.value ?? '');

      const sub = ctrl.valueChanges.subscribe((v) => {
        this.value.set(v ?? '');
        this.touched.set(ctrl.dirty || ctrl.touched);
      });

      onCleanup(() => sub.unsubscribe());
    });
  }

  readonly strength = computed(() => {
    const value = this.value();
    if (!value) return 0;

    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
    return score;
  });

  readonly strengthLabelKey = computed(
    () =>
      [
        'auth.strength.veryWeak',
        'auth.strength.weak',
        'auth.strength.ok',
        'auth.strength.good',
        'auth.strength.strong'
      ][this.strength()]
  );

  readonly strengthColor = computed(
    () => ['#8a8a8a', '#ff2a24', '#f59e0b', '#84cc16', '#22c55e'][this.strength()]
  );

  showError(): boolean {
    const ctrl = this.control();
    // Citim `touched` ca sa reevaluam si dupa blur, nu doar la tastare.
    this.touched();
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}
