import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  viewChild
} from '@angular/core';
import { AnimationService } from '../../core/services/animation.service';

/**
 * Plasa 3D animata din fundal.
 *
 * Este o grila de puncte proiectata in perspectiva, deformata de doua unde
 * sinusoidale. Nu foloseste three.js: proiectia si desenul incap in ~60 de
 * linii de matematica, iar pagina nu castiga nimic dintr-un motor WebGL de
 * sute de kiloocteti pentru un singur efect de fundal.
 *
 * Culoarea trece din rosu (aproape) in cyan (departe), iar cursorul inclina
 * usor camera - suficient cat sa para viu, nu cat sa distraga de la text.
 */
@Component({
  selector: 'aia-mesh-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv class="block h-full w-full"></canvas>`,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }
    `
  ]
})
export class MeshBackgroundComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  /** Cate linii pe latime. Mai putine = mai rarefiat si mai ieftin. */
  readonly cols = input(26);
  readonly rows = input(18);
  readonly amplitude = input(26);
  readonly speed = input(0.00042);

  private raf?: number;
  private observer?: ResizeObserver;
  private visibility?: IntersectionObserver;
  private onScreen = true;
  private readonly pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  ngAfterViewInit(): void {
    const canvas = this.cv().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.max(canvas.offsetWidth, 1) * dpr;
      canvas.height = Math.max(canvas.offsetHeight, 1) * dpr;
    };
    resize();
    this.observer = new ResizeObserver(resize);
    this.observer.observe(canvas);

    if (!this.anim.reducedMotion) {
      window.addEventListener('pointermove', this.onPointer, { passive: true });
    }

    // Fara asta, plasa continua sa deseneze 60 de cadre pe secunda si dupa ce
    // hero-ul a iesit de pe ecran - vizibil ca sacadare la scroll in restul paginii.
    this.visibility = new IntersectionObserver(
      (entries) => {
        this.onScreen = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0 }
    );
    this.visibility.observe(canvas);

    const draw = (time: number) => {
      if (!this.onScreen) {
        this.raf = requestAnimationFrame(draw);
        return;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Urmarire lina a cursorului: fara asta camera ar sari la fiecare miscare.
      this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.045;
      this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.045;

      const cols = this.cols();
      const rows = this.rows();
      const amp = this.amplitude() * dpr;
      const t = this.anim.reducedMotion ? 0 : time * this.speed();

      // Proiectie in perspectiva pentru o "podea" care fuge spre orizont.
      // p = 1 langa camera, tinde spre 0 la orizont; toate marimile se scaleaza cu p.
      const camZ = 5.2;
      const spanZ = 26;
      const halfSpanNear = width * 0.78;
      const horizonY = height * 0.34 + (this.pointer.y - 0.5) * height * 0.06;
      const baseY = height * 1.08;
      const cx = width / 2 + (this.pointer.x - 0.5) * width * 0.06;

      const grid: { x: number; y: number }[][] = [];
      for (let r = 0; r < rows; r++) {
        const z = (r / (rows - 1)) * spanZ;
        const p = camZ / (z + camZ);
        const row: { x: number; y: number }[] = [];

        for (let c = 0; c < cols; c++) {
          const nx = c / (cols - 1) - 0.5;
          const wave =
            Math.sin(nx * 7 + t) * amp + Math.cos(z * 0.5 - t * 1.4) * amp * 0.7;

          row.push({
            x: cx + nx * 2 * halfSpanNear * p,
            y: horizonY + (baseY - horizonY) * p + wave * p
          });
        }
        grid.push(row);
      }

      ctx.lineWidth = 1 * dpr;

      // Liniile orizontale (pe adancime) dau senzatia de podea.
      for (let r = 0; r < rows; r++) {
        const depth = r / (rows - 1);
        if (grid[r].length === 0) continue;
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = grid[r][c];
          c === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = this.strokeFor(depth);
        ctx.stroke();
      }

      // Liniile verticale, mai rare, ca sa nu se transforme in zgomot.
      for (let c = 0; c < cols; c += 2) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const p = grid[r][c];
          r === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = this.strokeFor(0.5);
        ctx.stroke();
      }

      // Noduri luminoase doar pe primele randuri, unde se si vad.
      for (let r = 0; r < rows; r++) {
        if (r % 2 !== 0) continue;
        const depth = r / (rows - 1);
        if (depth > 0.55) continue;
        for (let c = 0; c < cols; c += 2) {
          const p = grid[r][c];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 42, 36, ${(1 - depth) * 0.5})`;
          ctx.fill();
        }
      }

      this.raf = requestAnimationFrame(draw);
    };

    this.raf = requestAnimationFrame(draw);
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    this.visibility?.disconnect();
    window.removeEventListener('pointermove', this.onPointer);
  }

  /** Rosu in fata, cyan in departare, totul stins spre orizont. */
  private strokeFor(depth: number): string {
    const alpha = (1 - depth) * 0.38 + 0.03;
    const r = Math.round(225 * (1 - depth));
    const g = Math.round(6 + 215 * depth);
    const b = Math.round(0 + 255 * depth);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private readonly onPointer = (event: PointerEvent) => {
    this.pointer.tx = event.clientX / window.innerWidth;
    this.pointer.ty = event.clientY / window.innerHeight;
  };
}
