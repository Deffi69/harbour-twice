// main.js — wiring between the page and the engine: HUD readouts, the
// overlay cards for title / pause / scene clear / scene lost / run won,
// pointer clicks on both panels, the buttons, full keyboard play, and
// the staged screenshot mode (?scene=&found=&time=&overlay=).

import { Engine, MAX_MISTAKES } from './engine.js';
import { SoundKit } from './audio.js';
import { PANEL_W, PANEL_H } from './draw.js';

const $ = (id) => document.getElementById(id);
const sound = new SoundKit();

const params = new URLSearchParams(location.search);
const staged = params.has('scene') || params.has('found') || params.has('time');
let suppressOverlay = staged && params.get('overlay') === 'none';

const els = {
  sceneName: $('scene-name'),
  dots: $('scene-dots'),
  remaining: $('remaining-num'),
  score: $('score'),
  streak: $('streak'),
  pips: [...document.querySelectorAll('#mistake-box .pip')],
  timerWrap: $('timer-wrap'),
  timerBar: $('timer-bar'),
  timerText: $('timer-text'),
  hintsLeft: $('hints-left'),
  overlay: $('overlay'),
  overlayTitle: $('overlay-title'),
  overlayText: $('overlay-text'),
  overlayButtons: $('overlay-buttons'),
  btnHint: $('btn-hint'),
  btnMag: $('btn-mag'),
  btnPause: $('btn-pause'),
  btnSound: $('btn-sound'),
  btnRestart: $('btn-restart'),
};

const engine = new Engine({
  leftCanvas: $('panel-left'),
  rightCanvas: $('panel-right'),
  sound,
  onHud: updateHud,
  onPhase: showPhase,
});

/* ---------------- HUD ---------------- */

const cache = { sceneIndex: -1, mistakes: -1, hints: -1 };
function updateHud(s) {
  els.sceneName.textContent = `Scene ${s.sceneIndex + 1} — ${s.sceneTitle}`;
  if (cache.sceneIndex !== s.sceneIndex) {
    cache.sceneIndex = s.sceneIndex;
    els.dots.innerHTML = '';
    for (let i = 0; i < s.sceneCount; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i < s.sceneIndex ? ' done' : i === s.sceneIndex ? ' now' : '');
      els.dots.appendChild(d);
    }
  }
  els.remaining.textContent = String(s.remaining);
  els.score.textContent = String(s.score);
  els.streak.textContent = `×${s.streak}`;
  if (cache.mistakes !== s.mistakes) {
    cache.mistakes = s.mistakes;
    els.pips.forEach((pip, i) => pip.classList.toggle('spent', i < s.mistakes));
  }
  if (cache.hints !== s.hintsLeft) {
    cache.hints = s.hintsLeft;
    els.hintsLeft.textContent = String(s.hintsLeft);
    els.btnHint.disabled = s.hintsLeft <= 0;
  }
  const frac = s.timeTotal > 0 ? s.timeLeft / s.timeTotal : 0;
  els.timerBar.style.width = `${Math.max(0, frac * 100)}%`;
  els.timerWrap.classList.toggle('low', s.timeLeft <= 30);
  const t = Math.ceil(s.timeLeft);
  els.timerText.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

/* ---------------- overlays ---------------- */

function overlayButton(label, action) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', () => {
    sound.context();
    sound.click();
    action();
  });
  return b;
}

function showOverlay(title, text, buttons) {
  els.overlayTitle.textContent = title;
  els.overlayText.innerHTML = text;
  els.overlayButtons.innerHTML = '';
  for (const b of buttons) els.overlayButtons.appendChild(b);
  els.overlay.classList.remove('hidden');
}

function hideOverlay() {
  els.overlay.classList.add('hidden');
}

function showPhase(phase, s) {
  if (suppressOverlay) {
    hideOverlay();
    return;
  }
  if (phase === 'playing') {
    hideOverlay();
  } else if (phase === 'paused') {
    showOverlay('Paused', 'The harbour waits. The clock is stopped.', [
      overlayButton('Keep looking', () => engine.togglePause()),
      overlayButton('Restart scene', () => engine.retryScene()),
    ]);
  } else if (phase === 'roundWon') {
    showOverlay(
      `${s.sceneTitle} — clear!`,
      `Every difference found, with ${Math.ceil(s.timeLeft)} seconds to spare. ` +
        `Score so far: <strong>${s.score}</strong>.`,
      [overlayButton('Sail on →', () => engine.nextScene())],
    );
  } else if (phase === 'roundLost') {
    const reason = s.mistakes >= MAX_MISTAKES
      ? 'Five false alarms — the harbourmaster sends you back to look again.'
      : 'The light faded before you found them all.';
    showOverlay('Not this time', `${reason} Score kept: <strong>${s.score}</strong>.`, [
      overlayButton('Try this scene again', () => engine.retryScene()),
      overlayButton('Back to the start', () => engine.startRun()),
    ]);
  } else if (phase === 'runWon') {
    showOverlay(
      'The whole harbour, twice over! 🏆',
      `All 6 scenes, all 50 differences. Final score: <strong>${s.score}</strong>. ` +
        'The harbour is exactly as it was — because you noticed everything that was not.',
      [overlayButton('Play again', () => engine.startRun())],
    );
  } else if (phase === 'title') {
    showTitle();
  }
}

function showTitle() {
  showOverlay(
    'Harbour Twice',
    'One harbour, drawn twice — and the second drawing is quietly wrong. ' +
      '<strong>6 scenes, 50 differences</strong>, a clock that will not wait, ' +
      'and five false alarms per scene. Use the <strong>magnifier</strong> for the small print ' +
      'and the <strong>arrow keys + Enter</strong> if you prefer not to click.',
    [overlayButton('Start playing', () => engine.startRun())],
  );
}

/* ---------------- pointer ---------------- */

function panelPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * PANEL_W,
    y: ((event.clientY - rect.top) / rect.height) * PANEL_H,
  };
}

for (const [canvas, panel] of [[$('panel-left'), 'left'], [$('panel-right'), 'right']]) {
  canvas.addEventListener('pointermove', (e) => {
    const p = panelPoint(canvas, e);
    engine.setLens(panel, p.x, p.y);
    engine.crosshair.visible = false;
  });
  canvas.addEventListener('pointerdown', (e) => {
    sound.context();
    const p = panelPoint(canvas, e);
    engine.setLens(panel, p.x, p.y);
    engine.handlePoint(panel, p.x, p.y);
  });
}

/* ---------------- buttons ---------------- */

function toggleLens() {
  engine.lens.on = !engine.lens.on;
  els.btnMag.setAttribute('aria-pressed', String(engine.lens.on));
}

els.btnHint.addEventListener('click', () => { sound.context(); engine.useHint(); });
els.btnMag.addEventListener('click', () => { sound.context(); toggleLens(); });
els.btnPause.addEventListener('click', () => { sound.context(); engine.togglePause(); });
els.btnRestart.addEventListener('click', () => {
  sound.context();
  if (engine.phase !== 'title') engine.retryScene();
});
let soundOn = true;
els.btnSound.addEventListener('click', () => {
  soundOn = !soundOn;
  sound.setMuted(!soundOn);
  els.btnSound.setAttribute('aria-pressed', String(soundOn));
  els.btnSound.firstChild.textContent = soundOn ? '🔊 Sound ' : '🔇 Sound ';
  if (soundOn) { sound.context(); sound.click(); }
});

/* ---------------- keyboard ---------------- */

window.addEventListener('keydown', (e) => {
  const phase = engine.phase;
  const step = e.shiftKey ? 36 : 14;
  switch (e.key) {
    case 'ArrowLeft': engine.moveCrosshair(-step, 0); e.preventDefault(); break;
    case 'ArrowRight': engine.moveCrosshair(step, 0); e.preventDefault(); break;
    case 'ArrowUp': engine.moveCrosshair(0, -step); e.preventDefault(); break;
    case 'ArrowDown': engine.moveCrosshair(0, step); e.preventDefault(); break;
    case 'Enter':
      sound.context();
      if (phase === 'playing') engine.checkCrosshair();
      else if (phase === 'title') engine.startRun();
      else if (phase === 'roundWon') engine.nextScene();
      else if (phase === 'roundLost') engine.retryScene();
      else if (phase === 'runWon') engine.startRun();
      else if (phase === 'paused') engine.togglePause();
      e.preventDefault();
      break;
    case ' ':
      if (phase === 'playing') { engine.checkCrosshair(); e.preventDefault(); }
      break;
    case 'h': case 'H': engine.useHint(); break;
    case 'm': case 'M': toggleLens(); break;
    case 'p': case 'P': case 'Escape': engine.togglePause(); break;
    case 's': case 'S': els.btnSound.click(); break;
    case 'r': case 'R': if (phase !== 'title') engine.retryScene(); break;
    default: break;
  }
});

/* ---------------- staged screenshot mode / boot ---------------- */

if (staged) {
  engine.stage({
    scene: Number(params.get('scene') ?? 1),
    found: Number(params.get('found') ?? 0),
    time: Number(params.get('time') ?? 90),
    phase: params.get('phase') ?? 'playing',
  });
  if (params.get('mag') === '1') {
    engine.lens.on = true;
    els.btnMag.setAttribute('aria-pressed', 'true');
    engine.setLens('right',
      Number(params.get('lensx') ?? PANEL_W * 0.62),
      Number(params.get('lensy') ?? PANEL_H * 0.45));
  }
  if (params.get('cross') === '1') {
    engine.crosshair.visible = true;
    engine.crosshair.x = Number(params.get('crossx') ?? PANEL_W / 2);
    engine.crosshair.y = Number(params.get('crossy') ?? PANEL_H / 2);
  }
  if (params.get('overlay') === 'title') showTitle();
} else {
  showTitle();
}
