// audio.js — the game's little sound kit. Every sound is synthesized
// with the Web Audio API from oscillators, so the game ships no audio
// files and still chirps, buzzes and applauds. Sounds are original:
// short two- and three-note figures written for this game.

export class SoundKit {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  /** The shared AudioContext, created lazily on the first user gesture. */
  context() {
    if (this.ctx === null) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
  }

  /** One soft sine note with a quick attack and a gentle decay. */
  tone(freq, at, dur, type = 'sine', vol = 0.16) {
    const ctx = this.context();
    if (!ctx || this.muted) return;
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  /** A found difference: a bright two-note chime, E6 up to A6. */
  find() {
    this.tone(1318.5, 0, 0.16, 'sine', 0.18);
    this.tone(1760.0, 0.07, 0.24, 'sine', 0.18);
  }

  /** A wrong click: a low, dull buzz that says "not there". */
  miss() {
    this.tone(146.8, 0, 0.18, 'triangle', 0.2);
    this.tone(138.6, 0.02, 0.2, 'triangle', 0.14);
  }

  /** A hint being spent: a curious little glissando. */
  hint() {
    this.tone(659.3, 0, 0.1, 'sine', 0.12);
    this.tone(783.99, 0.08, 0.1, 'sine', 0.12);
    this.tone(1046.5, 0.16, 0.18, 'sine', 0.12);
  }

  /** The clock's last seconds: one dry tick. */
  tick() {
    this.tone(2093, 0, 0.05, 'square', 0.05);
  }

  /** A scene cleared: a small major arpeggio. */
  sceneClear() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, i * 0.09, 0.22, 'sine', 0.16));
  }

  /** The whole run won: the arpeggio, then its echo an octave up. */
  runWon() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((f, i) => this.tone(f, i * 0.1, 0.3, 'sine', 0.16));
  }

  /** Time up: two falling notes, kindly but final. */
  timeUp() {
    this.tone(392.0, 0, 0.25, 'sine', 0.16);
    this.tone(311.1, 0.18, 0.4, 'sine', 0.16);
  }

  /** A plain interface click. */
  click() {
    this.tone(880, 0, 0.06, 'sine', 0.08);
  }
}
