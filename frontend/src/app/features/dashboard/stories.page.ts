import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AcademyService } from '../../core/services/academy.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MediaService } from '../../core/services/media.service';
import { Story } from '../../core/models/models';
import { LoaderComponent } from '../../shared/components/ui-utilities';
import { TranslatePipe } from '@ngx-translate/core';

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

/**
 * Story-uri de 24 de ore.
 * Expirarea afisata aici este doar cosmetica - stergerea reala o face cron job-ul
 * din backend, ca sa nu depindem de vizitele utilizatorilor.
 */
@Component({
  selector: 'aia-stories',
  standalone: true,
  imports: [LoaderComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="aia-eyebrow">{{ 'stories.eyebrow' | translate }}</p>
          <h2 class="mt-3 font-display text-3xl">{{ 'stories.title' | translate }}</h2>
        </div>

        <label class="aia-btn aia-btn-primary cursor-pointer !px-5 !py-2.5">
          {{ (uploading() ? 'stories.uploading' : 'stories.add') | translate }}
          <input
            type="file"
            class="sr-only"
            [accept]="acceptAttr"
            (change)="onFile($event)"
            [disabled]="uploading()"
          />
        </label>
      </div>

      <p class="mt-3 text-sm" [style.color]="'var(--aia-text-muted)'">
        {{ 'stories.hint' | translate }}
      </p>

      @if (loading()) {
        <aia-loader label="Se incarca story-urile" />
      } @else if (stories().length) {
        <!-- Bara cu autorii -->
        <div class="mt-8 flex gap-4 overflow-x-auto pb-2">
          @for (story of stories(); track story.id; let i = $index) {
            <button type="button" class="shrink-0 text-center" (click)="openViewer(i)">
              <span
                class="grid h-[74px] w-[74px] place-items-center rounded-full p-[3px]"
                style="background: linear-gradient(135deg, var(--aia-blood-bright), var(--aia-blood-deep))"
              >
                <span
                  class="grid h-full w-full place-items-center overflow-hidden rounded-full font-display text-xl"
                  [style.backgroundColor]="'var(--aia-bg-elev-2)'"
                >
                  {{ initials(story.userName) }}
                </span>
              </span>
              <span class="mt-2 block max-w-[74px] truncate text-xs" [style.color]="'var(--aia-text-muted)'">
                {{ story.userName.split(' ')[0] }}
              </span>
            </button>
          }
        </div>

        <!-- Grila -->
        <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          @for (story of stories(); track story.id; let i = $index) {
            <figure class="aia-card group relative overflow-hidden">
              <button type="button" class="block w-full" (click)="openViewer(i)">
                <img
                  [src]="media.resolve(story.mediaUrl)"
                  [alt]="story.caption || ('Story de la ' + story.userName)"
                  class="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </button>

              <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                <p class="truncate font-heading text-xs uppercase tracking-wide text-white">{{ story.userName }}</p>
                <p class="text-[11px] text-white/60">{{ remaining(story) }}</p>
              </figcaption>

              @if (canDelete(story)) {
                <button
                  type="button"
                  class="absolute right-2 top-2 grid h-8 w-8 place-items-center bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  (click)="remove(story)"
                  [attr.aria-label]="'Sterge story-ul lui ' + story.userName"
                >
                  &times;
                </button>
              }
            </figure>
          }
        </div>
      } @else {
        <div class="aia-card mt-8 p-12 text-center">
          <p class="font-display text-2xl">{{ 'stories.empty' | translate }}</p>
          <p class="mt-3 text-sm" [style.color]="'var(--aia-text-muted)'">
            {{ 'stories.emptyText' | translate }}
          </p>
        </div>
      }
    </section>

    <!-- Viewer full-screen -->
    @if (viewerIndex() !== null) {
      <div
        class="fixed inset-0 z-[180] grid place-items-center bg-black/95 p-4"
        (click)="closeViewer()"
        role="dialog"
        aria-modal="true"
        aria-label="Vizualizare story"
      >
        @if (currentStory(); as story) {
          <div class="relative max-h-full w-full max-w-md" (click)="$event.stopPropagation()">
            <!-- Bara de progres a story-ului -->
            <div class="mb-3 flex gap-1">
              @for (s of stories(); track s.id; let i = $index) {
                <span
                  class="h-0.5 flex-1"
                  [style.backgroundColor]="i <= (viewerIndex() ?? 0) ? '#fff' : 'rgba(255,255,255,.25)'"
                ></span>
              }
            </div>

            <img [src]="media.resolve(story.mediaUrl)" [alt]="story.caption || 'Story'" class="max-h-[75vh] w-full object-contain" />

            <div class="mt-4 flex items-center justify-between text-white">
              <div>
                <p class="font-heading text-sm uppercase tracking-wide">{{ story.userName }}</p>
                @if (story.caption) {
                  <p class="mt-1 text-sm text-white/70">{{ story.caption }}</p>
                }
              </div>
              <p class="text-xs text-white/50">{{ remaining(story) }}</p>
            </div>

            <button
              type="button"
              class="absolute -top-2 right-0 -translate-y-full text-3xl text-white/70 hover:text-white"
              (click)="closeViewer()"
              aria-label="Inchide"
            >
              &times;
            </button>

            <button
              type="button"
              class="absolute left-0 top-1/2 h-24 w-16 -translate-y-1/2 text-4xl text-white/40 hover:text-white"
              (click)="prev()"
              aria-label="Story-ul anterior"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              class="absolute right-0 top-1/2 h-24 w-16 -translate-y-1/2 text-4xl text-white/40 hover:text-white"
              (click)="next()"
              aria-label="Story-ul urmator"
            >
              &rsaquo;
            </button>
          </div>
        }
      </div>
    }
  `
})
export class StoriesPage {
  private readonly academy = inject(AcademyService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly media = inject(MediaService);

  readonly acceptAttr = ACCEPTED.join(',');

  readonly stories = signal<Story[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly viewerIndex = signal<number | null>(null);

  readonly currentStory = computed(() => {
    const index = this.viewerIndex();
    return index === null ? null : (this.stories()[index] ?? null);
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.academy.activeStories().subscribe({
      next: (stories) => {
        this.stories.set(stories);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validam inainte de upload: economisim trafic si dam feedback instant.
    if (!ACCEPTED.includes(file.type)) {
      this.toast.error('Format neacceptat', 'Foloseste JPG, PNG, WEBP sau MP4.');
      input.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.toast.error('Fisier prea mare', 'Limita este de 8 MB.');
      input.value = '';
      return;
    }

    this.uploading.set(true);
    this.academy.uploadStory(file, '').subscribe({
      next: (story) => {
        this.stories.update((list) => [story, ...list]);
        this.uploading.set(false);
        input.value = '';
        this.toast.success('Story publicat', 'Va fi vizibil 24 de ore.');
      },
      error: () => {
        this.uploading.set(false);
        input.value = '';
      }
    });
  }

  remove(story: Story): void {
    this.academy.deleteStory(story.id).subscribe({
      next: () => {
        this.stories.update((list) => list.filter((s) => s.id !== story.id));
        this.toast.info('Story sters');
      }
    });
  }

  canDelete(story: Story): boolean {
    return story.userId === this.auth.user()?.id || this.auth.isTrainer();
  }

  openViewer(index: number): void {
    this.viewerIndex.set(index);
  }

  closeViewer(): void {
    this.viewerIndex.set(null);
  }

  next(): void {
    const total = this.stories().length;
    this.viewerIndex.update((i) => (i === null ? null : (i + 1) % total));
  }

  prev(): void {
    const total = this.stories().length;
    this.viewerIndex.update((i) => (i === null ? null : (i - 1 + total) % total));
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  /** Timp ramas pana la expirare, formatat scurt. */
  remaining(story: Story): string {
    const diff = new Date(story.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expira acum';
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    return hours > 0 ? `Mai are ${hours}h` : `Mai are ${minutes}m`;
  }
}
