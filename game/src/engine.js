// engine.js — the rules of Harbour Twice and the painting of its two
// panels. The engine owns the run: which scene, which differences were
// chosen, what has been found, the clock, the score, the streak, the
// false alarms, the hints, the keyboard crosshair and the magnifier
// lens. main.js wires it to the page; scenes.js only knows how to draw.

import { SCENES, paintScene } from './scenes.js';
import { rngFrom, shuffled } from './random.js';
import { PANEL_W, PANEL_H, TAU, ring, line, disc } from './draw.js';

export const MAX_MISTAKES = 5;
export const HINTS_PER_SCENE = 3;
const EMPTY_MAP = new Map();

export class Engine {
  constructor({ leftCanvas, rightCanvas, sound, onHud, onPhase }) {
    this.canvases = { left: leftCanvas, right: rightCanvas };
    this.ctx = {
      left: leftCanvas.getContext('2d'),
      right: rightCanvas.getContext('2d'),
    };
    // Each panel is painted to an offscreen buffer first, so the
    // magnifier can sample the finished picture without feedback.
    this.buffers = {};
    for (const side of ['left', 'right']) {
      const buf = document.createElement('canvas');
      buf.width = PANEL_W;
      buf.height = PANEL_H;
      this.buffers[side] = { canvas: buf, ctx: buf.getContext('2d') };
    }
    this.sound = sound;
    this.onHud = onHud;
    this.onPhase = onPhase;

    this.phase = 'title';
    this.runSeed = 'attract';
    this.score = 0;
    this.crosshair = { x: PANEL_W / 2, y: PANEL_H / 2, visible: false };
    this.lens = { on: false, panel: 'right', x: PANEL_W / 2, y: PANEL_H / 2 };
    this.setupScene(0, 'attract');
    this.phase = 'title';

    this.lastTime = performance.now();
    this.lastTickSecond = -1;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt, now / 1000);
      this.render(now / 1000);
      this.onHud(this.snapshot());
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------------- scene and run setup ---------------- */

  setupScene(index, seedSuffix) {
    const scene = SCENES[index];
    this.sceneIndex = index;
    this.sceneSeed = `${this.runSeed}:${scene.id}:${seedSuffix}`;
    const picker = rngFrom(`${this.sceneSeed}:pick`);
    const chosen = shuffled(picker, scene.elements).slice(0, scene.diffs);
    this.diffIds = chosen.map((el) => el.id);
    this.diffMap = new Map(chosen.map((el) => [el.id, 1]));
    this.byId = new Map(scene.elements.map((el) => [el.id, el]));
    this.found = new Set();
    this.timeTotal = scene.time;
    this.timeLeft = scene.time;
    this.mistakes = 0;
    this.hintsLeft = HINTS_PER_SCENE;
    this.streak = 0;
    this.anims = [];
    this.hintTarget = null;
    this.roundStartScore = this.score;
  }

  startRun() {
    this.runSeed = `run${Date.now().toString(36)}`;
    this.score = 0;
    this.attempt = 0;
    this.setupScene(0, 'try0');
    this.setPhase('playing');
  }

  retryScene() {
    this.score = this.roundStartScore;
    this.attempt = (this.attempt ?? 0) + 1;
    this.setupScene(this.sceneIndex, `try${this.attempt}`);
    this.setPhase('playing');
  }

  nextScene() {
    if (this.sceneIndex + 1 >= SCENES.length) return;
    this.attempt = 0;
    this.setupScene(this.sceneIndex + 1, 'try0');
    this.setPhase('playing');
  }

  setPhase(phase) {
    this.phase = phase;
    this.onPhase(phase, this.snapshot());
  }

  togglePause() {
    if (this.phase === 'playing') this.setPhase('paused');
    else if (this.phase === 'paused') this.setPhase('playing');
  }

  /* ---------------- staging (screenshot mode) ---------------- */

  /** Freeze a lived-in moment: a scene part-played, for screenshots. */
  stage({ scene = 1, found = 0, time = 90, phase = 'playing' } = {}) {
    this.runSeed = 'stage';
    this.score = 0;
    this.setupScene(Math.min(Math.max(scene - 1, 0), SCENES.length - 1), 'stage');
    this.score = found * 115 + 240;
    for (let i = 0; i < Math.min(found, this.diffIds.length); i++) {
      this.found.add(this.diffIds[i]);
    }
    this.timeLeft = time;
    this.setPhase(phase);
  }

  /* ---------------- play ---------------- */

  remaining() {
    return this.diffIds.length - this.found.size;
  }

  handlePoint(panel, x, y) {
    if (this.phase !== 'playing') return;
    let best = null;
    let bestDist = Infinity;
    for (const id of this.diffIds) {
      if (this.found.has(id)) continue;
      const el = this.byId.get(id);
      const d = Math.hypot(el.x - x, el.y - y);
      if (d < Math.max(el.r, 20) && d < bestDist) {
        best = el;
        bestDist = d;
      }
    }
    if (best) {
      this.found.add(best.id);
      this.streak += 1;
      const gained = 100 + (this.streak - 1) * 15;
      this.score += gained;
      this.anims.push({ kind: 'find', x: best.x, y: best.y, r: best.r, t: 0, text: `+${gained}` });
      this.sound.find();
      if (this.remaining() === 0) {
        const bonus = Math.round(this.timeLeft) * 2;
        this.score += bonus;
        if (this.sceneIndex + 1 >= SCENES.length) {
          this.sound.runWon();
          this.setPhase('runWon');
        } else {
          this.sound.sceneClear();
          this.setPhase('roundWon');
        }
      }
    } else {
      this.mistakes += 1;
      this.streak = 0;
      this.score = Math.max(0, this.score - 25);
      this.timeLeft = Math.max(0, this.timeLeft - 5);
      this.anims.push({ kind: 'miss', x, y, t: 0 });
      this.sound.miss();
      if (this.mistakes >= MAX_MISTAKES) {
        this.sound.timeUp();
        this.setPhase('roundLost');
      } else if (this.timeLeft <= 0) {
        this.sound.timeUp();
        this.setPhase('roundLost');
      }
    }
  }

  useHint() {
    if (this.phase !== 'playing' || this.hintsLeft <= 0) return;
    const open = this.diffIds.filter((id) => !this.found.has(id));
    if (open.length === 0) return;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - 100);
    const id = open[Math.floor(Math.random() * open.length)];
    this.hintTarget = { id, until: performance.now() / 1000 + 1.5 };
    this.sound.hint();
  }

  moveCrosshair(dx, dy) {
    this.crosshair.visible = true;
    this.crosshair.x = Math.min(PANEL_W - 6, Math.max(6, this.crosshair.x + dx));
    this.crosshair.y = Math.min(PANEL_H - 6, Math.max(6, this.crosshair.y + dy));
    this.lens.panel = 'right';
    this.lens.x = this.crosshair.x;
    this.lens.y = this.crosshair.y;
  }

  checkCrosshair() {
    this.handlePoint('right', this.crosshair.x, this.crosshair.y);
  }

  setLens(panel, x, y) {
    this.lens.panel = panel;
    this.lens.x = x;
    this.lens.y = y;
  }

  /* ---------------- per-frame update ---------------- */

  update(dt, now) {
    if (this.phase === 'playing') {
      this.timeLeft -= dt;
      const whole = Math.ceil(this.timeLeft);
      if (this.timeLeft <= 10.5 && whole !== this.lastTickSecond && this.timeLeft > 0) {
        this.lastTickSecond = whole;
        this.sound.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.sound.timeUp();
        this.setPhase('roundLost');
      }
    }
    for (const anim of this.anims) anim.t += dt;
    this.anims = this.anims.filter((a) => a.t < 0.6);
    if (this.hintTarget && now > this.hintTarget.until) this.hintTarget = null;
  }

  /* ---------------- rendering ---------------- */

  render(now) {
    for (const side of ['left', 'right']) {
      const { ctx: bg, canvas: buf } = this.buffers[side];
      paintScene(bg, SCENES[this.sceneIndex], this.sceneSeed, side === 'right' ? this.diffMap : EMPTY_MAP);
      this.drawMarkers(bg, now);
      const g = this.ctx[side];
      g.clearRect(0, 0, PANEL_W, PANEL_H);
      g.drawImage(buf, 0, 0);
      if (this.lens.on && this.lens.panel === side && this.phase !== 'title') {
        this.drawLens(g, buf, now);
      }
    }
  }

  drawMarkers(g, now) {
    // found differences wear a brass ring and a check, gently pulsing
    for (const id of this.found) {
      const el = this.byId.get(id);
      const pulse = 1 + Math.sin(now * 3.2) * 0.045;
      const r = (el.r + 7) * pulse;
      ring(g, el.x, el.y, r, 'rgba(16,26,36,0.85)', 6);
      ring(g, el.x, el.y, r, '#ffc93f', 3.5);
      const s = Math.min(11, el.r * 0.5);
      line(g, el.x - s * 0.62, el.y + s * 0.05, el.x - s * 0.14, el.y + s * 0.52, '#ffc93f', 3.4);
      line(g, el.x - s * 0.14, el.y + s * 0.52, el.x + s * 0.68, el.y - s * 0.5, '#ffc93f', 3.4);
    }
    // the hint ring: dashed amber, breathing around its element
    if (this.hintTarget) {
      const el = this.byId.get(this.hintTarget.id);
      if (el && !this.found.has(el.id)) {
        const r = el.r + 12 + Math.sin(now * 9) * 3.5;
        g.save();
        g.setLineDash([7, 6]);
        ring(g, el.x, el.y, r, '#ff9d2e', 3.5);
        g.restore();
      }
    }
    // click animations: expanding rings for finds, red crosses for misses
    for (const anim of this.anims) {
      const k = anim.t / 0.6;
      if (anim.kind === 'find') {
        ring(g, anim.x, anim.y, anim.r + 4 + k * 22, `rgba(255,201,63,${0.85 * (1 - k)})`, 4);
        g.fillStyle = `rgba(255,233,160,${1 - k})`;
        g.font = '800 19px "Trebuchet MS", sans-serif';
        g.textAlign = 'center';
        g.fillText(anim.text, anim.x, anim.y - anim.r - 12 - k * 20);
      } else {
        const s = 9;
        const alpha = 1 - k;
        line(g, anim.x - s, anim.y - s, anim.x + s, anim.y + s, `rgba(200,67,60,${alpha})`, 4.5);
        line(g, anim.x + s, anim.y - s, anim.x - s, anim.y + s, `rgba(200,67,60,${alpha})`, 4.5);
      }
    }
    // the keyboard crosshair, drawn on both panels at the same place
    if (this.crosshair.visible && this.phase === 'playing') {
      const { x, y } = this.crosshair;
      ring(g, x, y, 13, 'rgba(16,26,36,0.8)', 4.5);
      ring(g, x, y, 13, '#ffffff', 2.2);
      line(g, x - 20, y, x - 7, y, '#ffffff', 2.2);
      line(g, x + 7, y, x + 20, y, '#ffffff', 2.2);
      line(g, x, y - 20, x, y - 7, '#ffffff', 2.2);
      line(g, x, y + 7, x, y + 20, '#ffffff', 2.2);
      disc(g, x, y, 1.8, '#ffffff');
    }
  }

  /** The magnifier: a brass-rimmed lens showing the picture at 1.9x. */
  drawLens(g, buf, now) {
    const { x, y } = this.lens;
    const R = 62;
    const zoom = 1.9;
    const srcSize = (R * 2) / zoom;
    g.save();
    g.beginPath();
    g.arc(x, y, R, 0, TAU);
    g.clip();
    g.drawImage(
      buf,
      x - srcSize / 2, y - srcSize / 2, srcSize, srcSize,
      x - R, y - R, R * 2, R * 2,
    );
    g.restore();
    ring(g, x, y, R, '#8a6d1f', 7);
    ring(g, x, y, R, '#ffd97a', 3);
    line(g, x + R * 0.68, y + R * 0.68, x + R * 0.98, y + R * 0.98, '#8a6d1f', 9);
  }

  /* ---------------- HUD snapshot ---------------- */

  snapshot() {
    const scene = SCENES[this.sceneIndex];
    return {
      phase: this.phase,
      sceneIndex: this.sceneIndex,
      sceneCount: SCENES.length,
      sceneTitle: scene.title,
      sceneTagline: scene.tagline,
      total: this.diffIds.length,
      found: this.found.size,
      remaining: this.remaining(),
      score: this.score,
      streak: this.streak,
      mistakes: this.mistakes,
      maxMistakes: MAX_MISTAKES,
      hintsLeft: this.hintsLeft,
      timeLeft: Math.max(0, this.timeLeft),
      timeTotal: this.timeTotal,
    };
  }
}
