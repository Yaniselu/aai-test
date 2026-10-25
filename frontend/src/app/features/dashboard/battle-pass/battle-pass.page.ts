import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AcademyService } from '../../../core/services/academy.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { BattlePassRewardState, BattlePassState } from '../../../core/models/models';
import { ConfirmModalComponent, LoaderComponent } from '../../../shared/components/ui-utilities';
import { IconComponent } from '../../../shared/icons/icon.component';

/**
 * BATTLE PASS
 * -----------
 * Track vizual cu 5 trepte. O treapta se deblocheaza cand sportivul atinge
 * nivelul cerut SI are cel mult numarul de absente permis in luna curenta.
 *
 * Regula de afisare: recompensa blocata din cauza absentelor arata explicit
 * motivul, nu doar un lacat - altfel sportivul nu stie ce sa corecteze.
 */
@Component({
  selector: 'aia-battle-pass',
  standalone: true,
  imports: [LoaderComponent, ConfirmModalComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <aia-loader label="Se incarca Battle Pass-ul" />
    } @else if (state(); as bp) {
      <section>
        <p class="aia-eyebrow">Sezonul curent</p>
        <h2 class="mt-4 font-display text-4xl leading-tight">Battle Pass</h2>
        <p class="mt-4 max-w-2xl text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
          Prezenta adauga 50 XP, absenta scade 50 XP. Pe langa prag, fiecare recompensa cere
          <strong [style.color]="'var(--aia-blood-bright)'">maximum 2 absente in luna curenta</strong>.
          Echipamentul se castiga in luni de constanta, nu in cateva antrenamente.
        </p>

        <!-- Rezumat -->
        <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="aia-card p-5">
            <p class="font-display text-4xl" [style.color]="'var(--aia-blood)'">{{ bp.currentLevel }}</p>
            <p class="mt-1 font-heading text-[11px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">
              Nivel curent
            </p>
          </div>
          <div class="aia-card p-5">
            <p class="font-display text-4xl">{{ bp.xpPoints }}</p>
            <p class="mt-1 font-heading text-[11px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">
              XP total
            </p>
          </div>
          <div class="aia-card p-5">
            <p
              class="font-display text-4xl"
              [style.color]="bp.absencesThisMonth > 2 ? 'var(--aia-blood-bright)' : null"
            >
              {{ bp.absencesThisMonth }} / 2
            </p>
            <p class="mt-1 font-heading text-[11px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">
              Absente luna aceasta
            </p>
          </div>

          <div class="aia-card p-5">
            <p class="font-display text-4xl" [style.color]="'var(--aia-cyan)'">{{ xpToNext() }}</p>
            <p class="mt-1 font-heading text-[11px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">
              XP pana la urmatoarea recompensa
            </p>
          </div>
        </div>

        @if (bp.absencesThisMonth > 2) {
          <p
            class="mt-5 border-l-4 p-4 text-sm"
            style="border-left-color: var(--aia-blood); background: color-mix(in srgb, var(--aia-blood) 10%, transparent)"
            role="alert"
          >
            Ai depasit limita de absente pentru luna aceasta. Recompensele raman blocate pana la
            resetarea lunara, dar XP-ul acumulat nu se pierde.
          </p>
        }

        <!-- Bara de progres pe track -->
        <div class="relative mt-14">
          <div class="absolute left-0 right-0 top-[46px] h-1 rounded-full" [style.backgroundColor]="'var(--aia-border)'"></div>
          <div
            class="absolute left-0 top-[46px] h-1 rounded-full transition-all duration-1000"
            style="background: linear-gradient(90deg, var(--aia-blood-deep), var(--aia-blood-bright))"
            [style.width.%]="progressPercent()"
          ></div>

          <ol class="relative grid grid-cols-2 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            @for (reward of bp.rewards; track reward.id) {
              <li class="flex flex-col items-center px-2 text-center">
                <!-- Nodul de pe track -->
                <div
                  class="relative grid h-[92px] w-[92px] place-items-center rounded-[20px] border-2 transition-all duration-500"
                  [style.borderColor]="nodeBorder(reward)"
                  [style.backgroundColor]="reward.claimed ? 'var(--aia-blood)' : 'var(--aia-bg-elev)'"
                  [style.color]="reward.claimed ? '#fff' : reward.unlocked ? 'var(--aia-blood)' : 'var(--aia-text-muted)'"
                >
                  <aia-icon [name]="icon(reward)" [size]="30" [strokeWidth]="1.4" />

                  @if (reward.unlocked && !reward.claimed) {
                    <span
                      class="pointer-events-none absolute inset-0 rounded-[20px] border-2 border-[var(--aia-blood)]"
                      style="animation: aia-pulse 1.8s ease-out infinite"
                    ></span>
                  }
                </div>

                <p class="mt-5 aia-index text-[11px]" [style.color]="'var(--aia-cyan)'">
                  {{ reward.requiredXp }} XP
                </p>
                <p class="mt-1 font-heading text-sm font-semibold uppercase tracking-wide">{{ reward.name }}</p>
                <p class="mt-1 text-xs" [style.color]="'var(--aia-text-muted)'">{{ reward.description }}</p>

                <!-- Actiunea -->
                <div class="mt-4 w-full">
                  @if (reward.claimed) {
                    <span class="inline-flex items-center justify-center gap-1.5 font-heading text-[11px] uppercase tracking-[0.2em] text-[#22c55e]">
                      <aia-icon name="check" [size]="13" [strokeWidth]="2.4" />
                      Revendicat
                    </span>
                  } @else if (reward.unlocked) {
                    <button
                      type="button"
                      class="aia-btn aia-btn-primary w-full !px-3 !py-2 !text-[11px]"
                      (click)="askClaim(reward)"
                      [disabled]="claiming() === reward.id"
                    >
                      {{ claiming() === reward.id ? '...' : 'CLAIM' }}
                    </button>
                  } @else {
                    <span
                      class="inline-flex items-center justify-center gap-1.5 font-heading text-[11px] uppercase tracking-[0.2em]"
                      [style.color]="'var(--aia-text-muted)'"
                    >
                      <aia-icon name="lock" [size]="12" />
                      {{ lockReason(reward, bp) }}
                    </span>
                  }
                </div>
              </li>
            }
          </ol>
        </div>
      </section>

      <aia-confirm-modal
        [open]="!!pending()"
        title="Revendici recompensa?"
        [message]="confirmMessage()"
        confirmLabel="Da, revendic"
        (confirmed)="confirmClaim()"
        (cancelled)="pending.set(null)"
      />
    }
  `,
  styles: [
    `
      @keyframes aia-pulse {
        0% {
          transform: scale(1);
          opacity: 0.9;
        }
        100% {
          transform: scale(1.35);
          opacity: 0;
        }
      }
    `
  ]
})
export class BattlePassPage {
  private readonly academy = inject(AcademyService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly state = signal<BattlePassState | null>(null);
  readonly loading = signal(true);
  readonly claiming = signal<number | null>(null);
  readonly pending = signal<BattlePassRewardState | null>(null);

  /** Progresul pe intreg traseul, raportat la ultimul prag de XP. */
  readonly progressPercent = computed(() => {
    const bp = this.state();
    if (!bp || bp.rewards.length === 0) return 0;
    const max = Math.max(...bp.rewards.map((r) => r.requiredXp));
    return max > 0 ? Math.min((bp.xpPoints / max) * 100, 100) : 0;
  });

  /** Cat mai lipseste pana la urmatoarea recompensa. */
  readonly xpToNext = computed(() => {
    const bp = this.state();
    if (!bp) return 0;
    return Math.max(0, bp.nextThresholdXp - bp.xpPoints);
  });

  readonly confirmMessage = computed(() => {
    const reward = this.pending();
    return reward
      ? `Vei revendica "${reward.name}". Ridici echipamentul de la receptia salii in maximum 14 zile.`
      : '';
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.academy.battlePass().subscribe({
      next: (bp) => {
        this.state.set(bp);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  askClaim(reward: BattlePassRewardState): void {
    this.pending.set(reward);
  }

  confirmClaim(): void {
    const reward = this.pending();
    if (!reward) return;

    this.pending.set(null);
    this.claiming.set(reward.id);

    this.academy.claimReward(reward.id).subscribe({
      next: (bp) => {
        this.state.set(bp);
        this.claiming.set(null);
        this.auth.patchUser({ currentBattlepassLevel: bp.currentLevel, xpPoints: bp.xpPoints });
        this.toast.success('Recompensa revendicata!', `${reward.name} te asteapta la receptia salii.`);
      },
      error: () => this.claiming.set(null)
    });
  }

  nodeBorder(reward: BattlePassRewardState): string {
    if (reward.claimed) return 'var(--aia-blood)';
    if (reward.unlocked) return 'var(--aia-blood-bright)';
    return 'var(--aia-border)';
  }

  icon(reward: BattlePassRewardState): string {
    const icons: Record<number, string> = { 1: 'shirt', 2: 'shorts', 3: 'wrap', 4: 'shin-guard', 5: 'glove' };
    return reward.claimed ? 'check' : (icons[reward.requiredLevel] ?? 'gift');
  }

  lockReason(reward: BattlePassRewardState, bp: BattlePassState): string {
    if (bp.xpPoints < reward.requiredXp) {
      return `${reward.requiredXp - bp.xpPoints} XP`;
    }
    return 'Prea multe absente';
  }
}
