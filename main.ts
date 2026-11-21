// Harbour Twice — hand-in program (Node 22, standard library only).
// The game: a spot-the-difference voyage through one harbour drawn
// twice — 6 scenes, 50 differences, a magnifier and full keyboard play.
//
// The game itself is the static site in game/: two panels of hand-drawn
// canvas scenes, played offline in a desktop browser. This program is the
// courier. It carries game/ and screenshots/ from beside this file into
// the output directory and writes dossier.json there with the vendored
// make.fun library, so the judge reads exactly the files the player gets.
//
// In the grader the output directory is /output; anywhere else the
// MAKEFUN_OUTPUT_DIR environment variable names it instead:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The run is deterministic: same repository in, same bytes out.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps, passed through so this program refuses exactly
// what the scorer would refuse: at most 993 entries and 48 MiB of game
// files, paths of at most 1000 bytes, at most 4 screenshots of at most
// 256 KiB each, and the dossier's source text capped at 160 KiB.
const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
} as const;

function handIn(): void {
  mkdirSync(outputDir, { recursive: true });

  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

  // A game that arrives without its entry page or a module is worse
  // than no game at all — fail loudly here rather than at the gate.
  for (const needed of ['index.html', 'style.css', 'src/main.js', 'src/scenes.js', 'src/engine.js']) {
    if (!existsSync(join(outputDir, 'game', needed))) {
      throw new Error(`game payload is incomplete: missing ${needed}`);
    }
  }

  const shotsDir = join(outputDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  const localShots = join(repoRoot, 'screenshots');
  if (existsSync(localShots)) {
    cpSync(localShots, shotsDir, { recursive: true });
  }

  const dossier = buildDossier(outputDir, GATE_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
