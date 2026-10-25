import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AcademyService } from '../../core/services/academy.service';
import { AuthService } from '../../core/services/auth.service';
import { MediaService } from '../../core/services/media.service';
import { ToastService } from '../../core/services/toast.service';
import { Attendance } from '../../core/models/models';
import { IconComponent } from '../../shared/icons/icon.component';
import { ScheduleComponent } from '../../shared/components/schedule.component';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Profilul sportivului: date personale, XP, badge-uri, prezente si program. */
@Component({
  selector: 'aia-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, IconComponent, ScheduleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-12">
      <!-- ───── Date personale ───── -->
      <div class="aia-card p-6 lg:p-8">
        <div class="flex flex-wrap items-start justify-between gap-5">
          <div class="flex items-center gap-5">
            <!-- Avatar cu incarcare -->
            <label class="group relative cursor-pointer">
              <span
                class="grid h-20 w-20 place-items-center overflow-hidden rounded-[20px] border"
                [style.borderColor]="'var(--aia-border-strong)'"
                [style.backgroundColor]="'var(--aia-bg-elev-2)'"
              >
                @if (avatarUrl(); as url) {
                  <img [src]="url" alt="" class="h-full w-full object-cover" />
                } @else {
                  <span class="font-display text-2xl" [style.color]="'var(--aia-blood)'">{{ initials() }}</span>
                }
              </span>

              <span
                class="absolute inset-0 grid place-items-center rounded-[20px] bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <aia-icon name="upload" [size]="20" />
              </span>

              <input
                type="file"
                class="sr-only"
                accept="image/jpeg,image/png,image/webp"
                (change)="onAvatar($event)"
                [disabled]="uploading()"
              />
            </label>

            <div>
              <h2 class="font-display text-2xl">{{ auth.user()?.name }}</h2>
              <p class="mt-1 text-sm" [style.color]="'var(--aia-text-muted)'">
                {{ auth.user()?.xpPoints ?? 0 }} XP
                @if (auth.user()?.birthDate) {
                  &middot; {{ formatDate(auth.user()!.birthDate!) }}
                }
              </p>
              <p class="mt-1 text-xs" [style.color]="'var(--aia-text-muted)'">
                {{ 'dashboard.avatarHint' | translate }}
              </p>
            </div>
          </div>

          <button type="button" class="aia-btn aia-btn-ghost !px-5 !py-2.5" (click)="toggleEdit()">
            <aia-icon [name]="editing() ? 'close' : 'user'" [size]="15" />
            <span>{{ (editing() ? 'common.cancel' : 'dashboard.editProfile') | translate }}</span>
          </button>
        </div>

        @if (editing()) {
          <form [formGroup]="form" (ngSubmit)="save()" class="mt-7 grid gap-5 sm:grid-cols-2" novalidate>
            <div>
              <label class="aia-label" for="p-name">{{ 'auth.name' | translate }}</label>
              <input id="p-name" class="aia-input" formControlName="name" autocomplete="name" />
            </div>

            <div>
              <label class="aia-label" for="p-phone">{{ 'auth.phone' | translate }}</label>
              <input id="p-phone" type="tel" class="aia-input" formControlName="phone" autocomplete="tel" />
            </div>

            <div>
              <label class="aia-label" for="p-birth">{{ 'auth.birthDate' | translate }}</label>
              <input id="p-birth" type="date" class="aia-input" formControlName="birthDate" [max]="today" />
            </div>

            <div class="sm:col-span-2">
              <label class="aia-label" for="p-bio">{{ 'dashboard.bio' | translate }}</label>
              <textarea
                id="p-bio"
                rows="4"
                class="aia-input resize-none"
                formControlName="bio"
                maxlength="500"
                [placeholder]="'dashboard.bioPlaceholder' | translate"
              ></textarea>
              <p class="mt-1.5 text-right text-xs" [style.color]="'var(--aia-text-muted)'">
                {{ bioLength() }}/500
              </p>
            </div>

            <div class="sm:col-span-2">
              <button type="submit" class="aia-btn aia-btn-primary" [disabled]="saving()">
                <span>{{ (saving() ? 'common.saving' : 'common.save') | translate }}</span>
              </button>
            </div>
          </form>
        } @else if (auth.user()?.bio) {
          <p class="mt-6 max-w-2xl text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
            {{ auth.user()?.bio }}
          </p>
        }
      </div>

      <!-- ───── Evolutie ───── -->
      <div>
        <p class="aia-eyebrow">{{ 'dashboard.level' | translate }}</p>
        <h2 class="mt-3 font-display text-2xl lg:text-3xl">{{ 'dashboard.xp' | translate }}</h2>

        <div class="aia-card mt-5 p-6 lg:p-7">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <p class="font-display text-5xl leading-none" [style.color]="'var(--aia-blood)'">{{ xp() }}</p>
            <p class="text-right text-sm" [style.color]="'var(--aia-text-muted)'">
              {{ 'dashboard.absencesThisMonth' | translate }}: {{ auth.user()?.absencesCount ?? 0 }}
            </p>
          </div>

          <div class="mt-5 h-2 overflow-hidden rounded-full" [style.backgroundColor]="'var(--aia-bg-elev-2)'">
            <div
              class="h-full rounded-full transition-all duration-1000"
              style="background: linear-gradient(90deg, var(--aia-blood-deep), var(--aia-blood))"
              [style.width.%]="progress()"
            ></div>
          </div>

          <p class="mt-4 text-xs leading-relaxed" [style.color]="'var(--aia-text-muted)'">
            Fiecare antrenament la care esti prezent adauga 50 XP. O absenta scade 50 XP.
          </p>

          <a routerLink="/dashboard/battlepass" class="aia-btn aia-btn-ghost mt-6 !px-5 !py-2.5">
            <aia-icon name="trophy" [size]="15" />
            <span>{{ 'dashboard.battlePass' | translate }}</span>
          </a>
        </div>
      </div>

      <!-- ───── Badge-uri ───── -->
      <div>
        <p class="aia-eyebrow">Realizari</p>
        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (badge of badges(); track badge.name) {
            <div class="aia-card-flat p-5 text-center" [style.opacity]="badge.earned ? 1 : 0.4">
              <span [style.color]="badge.earned ? 'var(--aia-blood)' : 'var(--aia-text-muted)'">
                <aia-icon [name]="badge.icon" [size]="30" [strokeWidth]="1.3" />
              </span>
              <p class="mt-3 font-heading text-sm font-semibold uppercase tracking-wide">{{ badge.name }}</p>
              <p class="mt-1 text-xs" [style.color]="'var(--aia-text-muted)'">{{ badge.requirement }}</p>
            </div>
          }
        </div>
      </div>

      <!-- ───── Program ───── -->
      <div>
        <p class="aia-eyebrow">{{ 'schedule.eyebrow' | translate }}</p>
        <h2 class="mt-3 font-display text-2xl lg:text-3xl">{{ 'schedule.title' | translate }}</h2>
        <div class="mt-5">
          <aia-schedule [showNote]="false" />
        </div>
      </div>

      <!-- ───── Prezente ───── -->
      <div>
        <p class="aia-eyebrow">{{ 'dashboard.attendance' | translate }}</p>

        @if (attendance().length) {
          <div class="mt-5 flex flex-wrap gap-1.5">
            @for (record of attendance(); track record.id) {
              <span
                class="grid h-9 w-9 place-items-center rounded-[10px] border text-[10px]"
                [style.borderColor]="record.status === 'PRESENT' ? 'var(--aia-blood)' : 'var(--aia-border)'"
                [style.backgroundColor]="record.status === 'PRESENT' ? 'var(--aia-blood)' : 'transparent'"
                [style.color]="record.status === 'PRESENT' ? '#fff' : 'var(--aia-text-muted)'"
                [title]="record.date"
              >
                {{ dayOf(record.date) }}
              </span>
            }
          </div>
          <p class="mt-4 text-sm" [style.color]="'var(--aia-text-muted)'">
            {{ presentCount() }} prezente &middot; {{ absentCount() }} absente
          </p>
        } @else {
          <p class="mt-5 text-sm" [style.color]="'var(--aia-text-muted)'">
            Prezentele apar imediat ce antrenorul le marcheaza.
          </p>
        }
      </div>
    </section>
  `
})
export class ProfilePage {
  private readonly academy = inject(AcademyService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly mediaSvc = inject(MediaService);
  readonly auth = inject(AuthService);

  readonly attendance = signal<Attendance[]>([]);
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly uploading = signal(false);

  readonly today = new Date().toISOString().slice(0, 10);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    bio: [''],
    birthDate: ['']
  });

  readonly bioLength = signal(0);

  readonly avatarUrl = computed(() => this.mediaSvc.resolve(this.auth.user()?.avatarUrl));
  readonly xp = computed(() => this.auth.user()?.xpPoints ?? 0);

  /** Progresul spre pragul de 1800 XP (tricoul), primul obiectiv real. */
  readonly progress = computed(() => Math.min((this.xp() / 1800) * 100, 100));

  readonly presentCount = computed(() => this.attendance().filter((a) => a.status === 'PRESENT').length);
  readonly absentCount = computed(() => this.attendance().filter((a) => a.status === 'ABSENT').length);

  readonly badges = computed(() => {
    const xp = this.xp();
    const present = this.presentCount();
    return [
      { icon: 'target', name: 'Primul pas', requirement: 'Primul antrenament', earned: present >= 1 },
      { icon: 'flame', name: 'Constanta', requirement: '10 prezente', earned: present >= 10 },
      { icon: 'shield', name: 'Veteran', requirement: '5000 XP', earned: xp >= 5000 },
      { icon: 'trophy', name: 'Campion', requirement: '13000 XP', earned: xp >= 13000 }
    ];
  });

  constructor() {
    this.academy.myAttendance().subscribe({
      next: (records) => this.attendance.set(records)
    });

    this.form.controls.bio.valueChanges.subscribe((v) => this.bioLength.set((v ?? '').length));
  }

  toggleEdit(): void {
    if (!this.editing()) {
      const user = this.auth.user();
      this.form.patchValue({
        name: user?.name ?? '',
        phone: user?.phone ?? '',
        bio: user?.bio ?? '',
        birthDate: user?.birthDate ?? ''
      });
      this.bioLength.set((user?.bio ?? '').length);
    }
    this.editing.update((e) => !e);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    this.academy
      .updateProfile({
        name: value.name,
        phone: value.phone,
        bio: value.bio,
        birthDate: value.birthDate || null
      })
      .subscribe({
        next: (user) => {
          this.auth.patchUser(user);
          this.saving.set(false);
          this.editing.set(false);
          this.toast.success('Profil actualizat');
        },
        error: () => this.saving.set(false)
      });
  }

  onAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validam local inainte de upload: feedback instant si trafic economisit.
    if (!AVATAR_TYPES.includes(file.type)) {
      this.toast.error('Format neacceptat', 'Foloseste JPG, PNG sau WEBP.');
      input.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      this.toast.error('Fisier prea mare', 'Limita este de 2 MB.');
      input.value = '';
      return;
    }

    this.uploading.set(true);
    this.academy.uploadAvatar(file).subscribe({
      next: (user) => {
        this.auth.patchUser(user);
        this.uploading.set(false);
        input.value = '';
        this.toast.success('Poza de profil actualizata');
      },
      error: () => {
        this.uploading.set(false);
        input.value = '';
      }
    });
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  dayOf(date: string): string {
    return String(new Date(date).getDate());
  }

  initials(): string {
    const name = this.auth.user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
}
