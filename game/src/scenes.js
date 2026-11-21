// scenes.js — the six harbour worlds of Harbour Twice, and how each is
// painted. Every scene is drawn twice from the same seed: once plain
// (the left panel) and once with a handful of its elements flipped to
// their other variant (the right panel). An element is a named thing at
// a fixed place — the lighthouse lamp, a buoy, a cat — whose paint
// function draws variant 0 or variant 1. Because the seed never changes
// between panels, everything that is not a chosen difference comes out
// identical, down to the last star and grass blade.
//
// Scenes: 1 Harbour at Dawn · 2 The Fish Market · 3 The Ferry Deck
//         4 The Tide Pools · 5 The Keeper's Room · 6 Harbour at Night
// Differences per scene: 7 + 8 + 8 + 9 + 9 + 9 = 50.

import { rngFrom } from './random.js';
import {
  PANEL_W, PANEL_H, TAU, disc, ring, oval, line, poly, roundRect,
  star, crescent, cloud, grassTuft, sparkle, skyGradient,
} from './draw.js';

/** Paint one panel of a scene. diffMap maps element id -> variant for the changed panel. */
export function paintScene(g, scene, seedText, diffMap) {
  scene.paintBase(g, rngFrom(`${seedText}:${scene.id}:base`));
  for (const el of scene.elements) {
    el.paint(g, diffMap.get(el.id) ?? 0, rngFrom(`${seedText}:${scene.id}:${el.id}`));
  }
}

/** A gull in flight: two arcs for wings. */
function gull(g, x, y, s, color) {
  g.strokeStyle = color;
  g.lineWidth = 2.2;
  g.lineCap = 'round';
  g.beginPath();
  g.arc(x - s * 0.55, y, s * 0.55, Math.PI * 1.15, Math.PI * 1.95);
  g.arc(x + s * 0.55, y, s * 0.55, Math.PI * 1.05, Math.PI * 1.85);
  g.stroke();
}

/** A standing gull: body, head, beak, legs. */
function standingGull(g, x, y, s, flip = 1) {
  oval(g, x, y, s * 0.9, s * 0.55, '#f4f6f7');
  disc(g, x + flip * s * 0.75, y - s * 0.45, s * 0.34, '#f4f6f7');
  poly(g, [[x + flip * s * 1.05, y - s * 0.5], [x + flip * s * 1.5, y - s * 0.32], [x + flip * s * 1.02, y - s * 0.22]], '#e8a13a');
  line(g, x - s * 0.1, y + s * 0.5, x - s * 0.1, y + s * 0.95, '#e8a13a', 2);
  line(g, x + s * 0.25, y + s * 0.5, x + s * 0.25, y + s * 0.95, '#e8a13a', 2);
  disc(g, x + flip * s * 0.82, y - s * 0.5, s * 0.07, '#20303e');
}

/** Twinkles on water: short bright dashes at seeded places. */
function seaSparkle(g, rng, y0, y1, count, color = 'rgba(255,255,255,0.5)') {
  g.strokeStyle = color;
  g.lineWidth = 2;
  g.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = rng() * PANEL_W;
    const y = y0 + rng() * (y1 - y0);
    const w = 5 + rng() * 12;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + w, y);
    g.stroke();
  }
}

/** A simple moored fishing boat: hull, cabin, mast. Sails are elements, not base. */
function mooredBoat(g, x, y, s, hullColor) {
  poly(g, [[x - 52 * s, y], [x + 52 * s, y], [x + 38 * s, y + 20 * s], [x - 38 * s, y + 20 * s]], hullColor);
  roundRect(g, x - 16 * s, y - 18 * s, 34 * s, 18 * s, 3 * s, '#f7f2df');
  disc(g, x + 0 * s, y - 9 * s, 4.5 * s, '#31556e');
  line(g, x - 30 * s, y, x - 30 * s, y - 62 * s, '#6b4a2b', 3.5 * s);
}

/** A harbour lamp post; the glass is painted by an element, the post is base. */
function lampPost(g, x, yBase, h) {
  line(g, x, yBase, x, yBase - h, '#22303c', 5);
  line(g, x - 10, yBase - h + 12, x + 10, yBase - h + 12, '#22303c', 3);
}

/* ================================================================== */
/* Scene 1 — Harbour at Dawn                                          */
/* ================================================================== */

const dawn = {
  id: 'dawn',
  title: 'Harbour at Dawn',
  tagline: 'First light over the quay. Seven things have already changed.',
  diffs: 7,
  time: 150,
  paintBase(g, rng) {
    g.fillStyle = skyGradient(g, [[0, '#7fb2d9'], [0.45, '#f6c98f'], [0.62, '#f9e2ae']], 260);
    g.fillRect(0, 0, PANEL_W, 260);
    cloud(g, 120, 62, 26, 'rgba(255,244,220,0.85)', rng);
    cloud(g, 300, 40, 20, 'rgba(255,244,220,0.7)', rng);
    // distant headland
    poly(g, [[400, 250], [470, 196], [560, 226], [560, 260], [400, 260]], '#5d7d94');
    // sea
    g.fillStyle = skyGradient(g, [[0, '#4d84a6'], [1, '#2c5a7c']], 0);
    g.fillStyle = '#3a719b';
    g.fillRect(0, 250, PANEL_W, 112);
    seaSparkle(g, rng, 258, 350, 42, 'rgba(255,236,190,0.55)');
    // rocks under the lighthouse
    poly(g, [[0, 362], [0, 300], [52, 276], [128, 292], [150, 362]], '#5a6672');
    poly(g, [[0, 362], [0, 330], [60, 312], [132, 326], [150, 362]], '#6d7a86');
    // lighthouse tower (lamp and flag are elements)
    poly(g, [[58, 300], [104, 300], [98, 150], [64, 150]], '#e8e2d2');
    poly(g, [[62, 262], [101, 262], [99, 226], [64, 226]], '#c8433c');
    poly(g, [[66, 190], [97, 190], [95, 158], [68, 158]], '#c8433c');
    roundRect(g, 56, 128, 50, 14, 4, '#31424f');
    line(g, 81, 128, 81, 96, '#31424f', 3);
    // quay
    g.fillStyle = '#7c8894';
    g.fillRect(0, 362, PANEL_W, PANEL_H - 362);
    g.fillStyle = '#93a1ad';
    g.fillRect(0, 362, PANEL_W, 8);
    for (let x = 26; x < PANEL_W; x += 74) {
      roundRect(g, x, 392, 26, 12, 5, '#5f6b76');
    }
    grassTuft(g, 168, 366, 12, '#4d7c4d', rng);
    grassTuft(g, 545, 368, 11, '#4d7c4d', rng);
    // moored boats (sails are elements)
    mooredBoat(g, 208, 336, 1, '#31556e');
    mooredBoat(g, 428, 322, 0.78, '#7a3b2e');
    lampPost(g, 300, 364, 52);
    // harbourmaster's house on the quay (its window is an element)
    roundRect(g, 452, 268, 96, 94, 4, '#a9805a');
    poly(g, [[444, 270], [500, 232], [556, 270]], '#6e4433');
    roundRect(g, 470, 322, 22, 40, 3, '#4a3423');
    disc(g, 488, 343, 2.5, '#ffd97a');
  },
  elements: [
    {
      id: 'sun', x: 452, y: 196, r: 40, label: 'the rising sun',
      paint(g, v) {
        const cy = v === 0 ? 210 : 168;
        disc(g, 452, cy, 40, 'rgba(255,205,92,0.35)');
        disc(g, 452, cy, 27, '#ffd35c');
        disc(g, 452, cy, 21, '#ffe08a');
      },
    },
    {
      id: 'lamp', x: 81, y: 116, r: 26, label: 'the lighthouse lamp',
      paint(g, v) {
        roundRect(g, 68, 100, 26, 26, 4, '#31424f');
        if (v === 0) {
          disc(g, 81, 113, 8, '#ffe9a0');
          poly(g, [[92, 106], [210, 84], [210, 128], [92, 120]], 'rgba(255,233,160,0.35)');
          disc(g, 81, 113, 15, 'rgba(255,233,160,0.35)');
        } else {
          roundRect(g, 72, 104, 18, 18, 3, '#5d7484');
        }
      },
    },
    {
      id: 'flag', x: 92, y: 88, r: 17, label: 'the lighthouse flag',
      paint(g, v) {
        if (v === 0) poly(g, [[81, 78], [106, 84], [81, 92]], '#c8433c');
      },
    },
    {
      id: 'sail', x: 196, y: 282, r: 32, label: 'the sail',
      paint(g, v) {
        if (v === 0) {
          poly(g, [[180, 274], [180, 332], [226, 332]], '#fbf7ea');
          poly(g, [[176, 282], [176, 332], [150, 332]], '#e8dfc8');
        } else {
          roundRect(g, 172, 326, 58, 7, 3, '#d9cfb2');
        }
      },
    },
    {
      id: 'gulls', x: 330, y: 84, r: 32, label: 'the gulls',
      paint(g, v) {
        gull(g, 306, 78, 13, '#33566e');
        gull(g, 338, 62, 10, '#33566e');
        if (v === 0) gull(g, 356, 96, 11, '#33566e');
      },
    },
    {
      id: 'buoy', x: 356, y: 330, r: 17, label: 'the buoy',
      paint(g, v) {
        oval(g, 356, 336, 17, 5, 'rgba(0,0,0,0.18)');
        poly(g, [[342, 332], [370, 332], [364, 312], [348, 312]], v === 0 ? '#c8433c' : '#3f8f57');
        roundRect(g, 346, 320, 20, 6, 2, '#f4f1e6');
        disc(g, 356, 309, 3.5, '#31424f');
      },
    },
    {
      id: 'crates', x: 138, y: 372, r: 26, label: 'the crate stack',
      paint(g, v) {
        const crate = (x, y) => {
          roundRect(g, x, y, 34, 24, 2, '#a9805a');
          line(g, x, y, x + 34, y + 24, '#8a683f', 2);
          line(g, x + 34, y, x, y + 24, '#8a683f', 2);
        };
        crate(118, 356);
        crate(156, 356);
        if (v === 0) crate(137, 330);
      },
    },
    {
      id: 'lantern', x: 300, y: 306, r: 18, label: 'the quay lantern',
      paint(g, v) {
        roundRect(g, 291, 296, 18, 22, 3, '#22303c');
        if (v === 0) {
          roundRect(g, 295, 300, 10, 14, 2, '#ffd35c');
          disc(g, 300, 307, 16, 'rgba(255,211,92,0.30)');
        } else {
          roundRect(g, 295, 300, 10, 14, 2, '#5d7484');
        }
      },
    },
    {
      id: 'fisherman', x: 398, y: 340, r: 26, label: 'the fisherman',
      paint(g, v) {
        disc(g, 398, 318, 7, '#e8b98d');
        poly(g, [[398, 306], [386, 312], [410, 312]], '#31556e');
        line(g, 398, 325, 398, 348, '#31424f', 6);
        line(g, 398, 348, 390, 372, '#31424f', 5);
        line(g, 398, 348, 407, 372, '#31424f', 5);
        line(g, 398, 330, 384, 340, '#31424f', 5);
        if (v === 0) {
          line(g, 386, 338, 344, 300, '#6b4a2b', 2.5);
          line(g, 344, 300, 344, 322, 'rgba(255,255,255,0.65)', 1);
        } else {
          line(g, 398, 330, 410, 342, '#31424f', 5);
        }
      },
    },
    {
      id: 'houseCat', x: 508, y: 292, r: 17, label: 'the cat in the window',
      paint(g, v) {
        roundRect(g, 492, 276, 32, 34, 3, '#ffd98f');
        line(g, 508, 276, 508, 310, '#6e4433', 3);
        if (v === 0) {
          oval(g, 508, 300, 8, 6, '#31424f');
          disc(g, 508, 291, 5.5, '#31424f');
          poly(g, [[504, 288], [502, 282], [507, 285]], '#31424f');
          poly(g, [[512, 288], [514, 282], [509, 285]], '#31424f');
        }
      },
    },
  ],
};

/* ================================================================== */
/* Scene 2 — The Fish Market                                          */
/* ================================================================== */

const market = {
  id: 'market',
  title: 'The Fish Market',
  tagline: 'The morning catch is in. Eight things are not where they were.',
  diffs: 8,
  time: 145,
  paintBase(g, rng) {
    g.fillStyle = skyGradient(g, [[0, '#a8cbe8'], [1, '#e8f0e8']], 210);
    g.fillRect(0, 0, PANEL_W, 210);
    // rooftops behind the square
    poly(g, [[0, 210], [0, 150], [90, 118], [180, 150], [180, 210]], '#7d94a6');
    poly(g, [[380, 210], [380, 140], [470, 108], [560, 140], [560, 210]], '#71879a');
    // cobbled square
    g.fillStyle = '#9a8f7d';
    g.fillRect(0, 300, PANEL_W, PANEL_H - 300);
    g.strokeStyle = 'rgba(70,60,45,0.35)';
    g.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) {
      const x = rng() * PANEL_W;
      const y = 308 + rng() * 104;
      g.beginPath();
      g.ellipse(x, y, 14 + rng() * 12, 5, 0, 0, TAU);
      g.stroke();
    }
    // main stall: posts and counter (the awning is an element)
    roundRect(g, 66, 196, 8, 128, 3, '#6b4a2b');
    roundRect(g, 316, 196, 8, 128, 3, '#6b4a2b');
    roundRect(g, 52, 262, 300, 16, 4, '#8a683f');
    roundRect(g, 58, 278, 288, 46, 4, '#77572f');
    // second stall, plainer, to the right
    roundRect(g, 392, 226, 7, 98, 3, '#6b4a2b');
    roundRect(g, 520, 226, 7, 98, 3, '#6b4a2b');
    poly(g, [[384, 228], [534, 228], [520, 202], [398, 202]], '#b8b0a0');
    roundRect(g, 388, 272, 142, 13, 4, '#8a683f');
    roundRect(g, 392, 285, 134, 39, 4, '#77572f');
    // barrels by the main stall
    for (const bx of [368, 404]) {
      roundRect(g, bx, 330, 30, 44, 6, '#8a683f');
      line(g, bx, 344, bx + 30, 344, '#6e5230', 3);
      line(g, bx, 360, bx + 30, 360, '#6e5230', 3);
    }
    grassTuft(g, 30, 416, 12, '#5d7d4d', rng);
    grassTuft(g, 540, 414, 12, '#5d7d4d', rng);
  },
  elements: [
    {
      id: 'awning', x: 195, y: 130, r: 46, label: 'the striped awning',
      paint(g, v) {
        const cols = v === 0 ? ['#c8433c', '#f7f2df'] : ['#31556e', '#f7f2df'];
        for (let i = 0; i < 6; i++) {
          poly(g, [[58 + i * 46, 158], [58 + (i + 1) * 46, 158], [70 + (i + 1) * 46, 104], [70 + i * 46, 104]], cols[i % 2]);
        }
        for (let i = 0; i < 6; i++) {
          g.beginPath();
          g.arc(81 + i * 46, 158, 23, 0, Math.PI);
          g.fillStyle = cols[i % 2];
          g.fill();
        }
      },
    },
    {
      id: 'buoyString', x: 195, y: 178, r: 34, label: 'the string of buoys',
      paint(g, v, rng) {
        line(g, 84, 166, 306, 178, '#5d4a33', 2);
        const n = v === 0 ? 5 : 4;
        const cols = ['#c8433c', '#e8a13a', '#3f8f57', '#31556e', '#c8433c'];
        for (let i = 0; i < n; i++) {
          const x = 106 + i * 44;
          const y = 172 + Math.sin((i / (n - 1)) * Math.PI) * 6;
          disc(g, x, y, 8, cols[i % cols.length]);
          disc(g, x - 2.5, y - 2.5, 2.5, 'rgba(255,255,255,0.6)');
        }
      },
    },
    {
      id: 'fishCrate', x: 148, y: 240, r: 28, label: 'the crate of fish',
      paint(g, v) {
        roundRect(g, 108, 232, 82, 26, 3, '#a9805a');
        line(g, 108, 245, 190, 245, '#8a683f', 2);
        const tails = v === 0 ? [122, 140, 158, 176] : [124, 146, 168];
        for (const x of tails) {
          poly(g, [[x, 234], [x - 7, 218], [x + 2, 222], [x + 8, 216]], '#8fb6c9');
          disc(g, x + 1, 230, 2, '#20303e');
        }
      },
    },
    {
      id: 'scale', x: 292, y: 208, r: 22, label: 'the hanging scale',
      paint(g, v) {
        line(g, 292, 176, 292, 196, '#31424f', 3);
        line(g, 278, 208, 292, 196, '#31424f', 1.8);
        line(g, 306, 208, 292, 196, '#31424f', 1.8);
        oval(g, 292, 212, 17, 5, '#c89b3c');
        if (v === 0) {
          oval(g, 292, 205, 12, 5, '#8fb6c9', -0.3);
          poly(g, [[303, 202], [312, 196], [310, 208]], '#7aa5bd');
        }
      },
    },
    {
      id: 'cat', x: 128, y: 330, r: 22, label: 'the cat under the counter',
      paint(g, v) {
        if (v !== 0) return;
        oval(g, 128, 338, 15, 9, '#e8913a');
        disc(g, 145, 330, 8, '#e8913a');
        poly(g, [[139, 325], [137, 317], [144, 321]], '#e8913a');
        poly(g, [[150, 325], [152, 317], [145, 321]], '#e8913a');
        g.strokeStyle = '#e8913a';
        g.lineWidth = 4;
        g.beginPath();
        g.arc(112, 332, 8, Math.PI * 0.4, Math.PI * 1.4);
        g.stroke();
        disc(g, 142, 329, 1.6, '#20303e');
        disc(g, 148, 329, 1.6, '#20303e');
      },
    },
    {
      id: 'roofGull', x: 330, y: 92, r: 17, label: 'the gull on the roof',
      paint(g, v) {
        if (v === 0) standingGull(g, 330, 88, 11, -1);
      },
    },
    {
      id: 'vendorHat', x: 238, y: 196, r: 19, label: "the fishmonger's hat",
      paint(g, v) {
        oval(g, 238, 224, 17, 20, '#7a5b3a');
        disc(g, 238, 200, 11, '#e8b98d');
        const hat = v === 0 ? '#e8c33a' : '#3f8f57';
        poly(g, [[222, 196], [254, 196], [246, 184], [230, 184]], hat);
        roundRect(g, 218, 194, 40, 5, 2, hat);
        disc(g, 234, 199, 1.6, '#20303e');
        disc(g, 242, 199, 1.6, '#20303e');
      },
    },
    {
      id: 'chalkboard', x: 458, y: 252, r: 24, label: 'the chalkboard',
      paint(g, v) {
        roundRect(g, 430, 226, 56, 52, 4, '#31424f');
        roundRect(g, 435, 231, 46, 42, 3, '#3d5a4c');
        g.strokeStyle = '#f7f2df';
        g.lineWidth = 2;
        if (v === 0) {
          star(g, 458, 246, 9, '#f7f2df');
        } else {
          g.beginPath();
          g.moveTo(458, 254);
          g.bezierCurveTo(444, 240, 452, 232, 458, 240);
          g.bezierCurveTo(464, 232, 472, 240, 458, 254);
          g.fillStyle = '#f7f2df';
          g.fill();
        }
        line(g, 442, 264, 474, 264, 'rgba(247,242,223,0.8)', 2);
        line(g, 442, 269, 466, 269, 'rgba(247,242,223,0.8)', 2);
      },
    },
    {
      id: 'lobsterPots', x: 492, y: 348, r: 26, label: 'the lobster pots',
      paint(g, v) {
        const pot = (y) => {
          poly(g, [[466, y], [518, y], [510, y + 24], [474, y + 24]], '#6e7f6a');
          line(g, 466, y + 8, 518, y + 8, '#55654f', 3);
          line(g, 466, y + 16, 518, y + 16, '#55654f', 3);
        };
        pot(352);
        pot(326);
        if (v === 0) pot(300);
      },
    },
    {
      id: 'fishSign', x: 66, y: 216, r: 20, label: 'the wooden fish sign',
      paint(g, v) {
        const flip = v === 0 ? 1 : -1;
        oval(g, 66, 216, 17, 8, '#c89b3c');
        poly(g, [[66 - flip * 15, 216], [66 - flip * 26, 207], [66 - flip * 26, 225]], '#c89b3c');
        disc(g, 66 + flip * 9, 213, 2.2, '#4a3205');
        line(g, 66, 208, 66, 200, '#6b4a2b', 2);
      },
    },
  ],
};

/* ================================================================== */
/* Scene 3 — The Ferry Deck                                           */
/* ================================================================== */

const ferry = {
  id: 'ferry',
  title: 'The Ferry Deck',
  tagline: 'The ferry is loading for the crossing. Eight things are off.',
  diffs: 8,
  time: 140,
  paintBase(g, rng) {
    g.fillStyle = skyGradient(g, [[0, '#8fc3e8'], [1, '#dceef7']], 190);
    g.fillRect(0, 0, PANEL_W, 190);
    cloud(g, 110, 52, 22, 'rgba(255,255,255,0.9)', rng);
    cloud(g, 430, 36, 17, 'rgba(255,255,255,0.8)', rng);
    // the far shore: a smudge of harbour rooftops and a tiny lighthouse
    g.fillStyle = '#6d8ca3';
    g.fillRect(0, 168, PANEL_W, 18);
    for (const [x, w, h] of [[30, 40, 16], [86, 30, 22], [300, 46, 14], [420, 34, 20], [470, 52, 12]]) {
      g.fillRect(x, 168 - h, w, h);
    }
    roundRect(g, 238, 128, 10, 40, 2, '#6d8ca3');
    disc(g, 243, 124, 5, '#ffd35c');
    // sea
    g.fillStyle = '#2f6d8f';
    g.fillRect(0, 186, PANEL_W, PANEL_H - 186);
    seaSparkle(g, rng, 196, 410, 34, 'rgba(255,255,255,0.35)');
    // funnel (its band is an element)
    roundRect(g, 414, 116, 40, 92, 6, '#31424f');
    // bridge and superstructure
    roundRect(g, 192, 156, 182, 52, 6, '#e9e4d2');
    roundRect(g, 146, 204, 272, 86, 5, '#f4efdd');
    // deck and hull
    roundRect(g, 36, 288, 488, 14, 4, '#6b4a2b');
    poly(g, [[30, 302], [530, 302], [492, 372], [72, 372]], '#28536e');
    g.fillStyle = '#c8433c';
    g.fillRect(64, 356, 432, 9);
    // railing on the open deck, right side
    for (let x = 436; x <= 516; x += 16) line(g, x, 288, x, 262, '#d8dee2', 3);
    line(g, 430, 262, 522, 262, '#d8dee2', 3);
    line(g, 430, 275, 522, 275, '#d8dee2', 2);
    // lifeboat davits, left side (the boat itself is an element)
    line(g, 66, 288, 66, 214, '#31424f', 5);
    line(g, 138, 288, 138, 214, '#31424f', 5);
    line(g, 66, 214, 138, 214, '#31424f', 4);
    // stern flag pole (the flag is an element)
    line(g, 56, 288, 56, 206, '#6b4a2b', 4);
  },
  elements: [
    {
      id: 'funnelBand', x: 434, y: 136, r: 21, label: "the funnel's band",
      paint(g, v) {
        roundRect(g, 414, 126, 40, 20, 4, v === 0 ? '#31556e' : '#c8433c');
      },
    },
    {
      id: 'funnelGull', x: 434, y: 104, r: 15, label: 'the gull on the funnel',
      paint(g, v) {
        if (v === 0) standingGull(g, 434, 100, 10, 1);
      },
    },
    {
      id: 'bridgeFace', x: 283, y: 178, r: 24, label: 'the captain at the window',
      paint(g, v) {
        roundRect(g, 232, 164, 102, 30, 4, '#9fc6dd');
        line(g, 283, 164, 283, 194, '#e9e4d2', 4);
        if (v === 0) {
          disc(g, 258, 182, 8, '#31424f');
          poly(g, [[250, 176], [266, 176], [262, 168], [254, 168]], '#f4efdd');
          oval(g, 258, 196, 11, 6, '#31424f');
        }
      },
    },
    {
      id: 'portholes', x: 282, y: 246, r: 46, label: 'the portholes',
      paint(g, v) {
        const xs = [196, 240, 284, 328];
        xs.forEach((x, i) => {
          const lit = v === 0 || i !== 2;
          disc(g, x, 246, 11, '#31424f');
          disc(g, x, 246, 8, lit ? '#ffd35c' : '#5d7484');
        });
      },
    },
    {
      id: 'lifeRing', x: 380, y: 252, r: 17, label: 'the life ring',
      paint(g, v) {
        disc(g, 380, 246, 3, '#8a8f94');
        if (v !== 0) return;
        ring(g, 380, 254, 12, '#f4f1e6', 7);
        for (const a of [0.4, 1.95, 3.5, 5.1]) {
          g.strokeStyle = '#c8433c';
          g.lineWidth = 7;
          g.beginPath();
          g.arc(380, 254, 12, a, a + 0.7);
          g.stroke();
        }
      },
    },
    {
      id: 'lifeboat', x: 102, y: 228, r: 28, label: 'the lifeboat',
      paint(g, v) {
        line(g, 74, 214, 74, 224, '#31424f', 2.5);
        line(g, 130, 214, 130, 224, '#31424f', 2.5);
        poly(g, [[62, 226], [142, 226], [132, 244], [72, 244]], v === 0 ? '#e07b39' : '#f4f1e6');
        roundRect(g, 62, 222, 80, 6, 3, '#31424f');
      },
    },
    {
      id: 'sternFlag', x: 72, y: 216, r: 18, label: 'the stern flag',
      paint(g, v) {
        if (v === 0) poly(g, [[56, 208], [86, 214], [56, 222]], '#e8c33a');
      },
    },
    {
      id: 'passenger', x: 478, y: 252, r: 24, label: 'the passenger',
      paint(g, v) {
        if (v !== 0) return;
        disc(g, 478, 232, 8, '#e8b98d');
        poly(g, [[478, 220], [466, 228], [490, 228]], '#c8433c');
        line(g, 478, 240, 478, 264, '#3f5a46', 7);
        line(g, 478, 264, 470, 288, '#31424f', 5);
        line(g, 478, 264, 487, 288, '#31424f', 5);
        line(g, 478, 246, 492, 258, '#3f5a46', 5);
      },
    },
    {
      id: 'ropeCoil', x: 452, y: 316, r: 16, label: 'the coil of rope',
      paint(g, v) {
        if (v !== 0) return;
        ring(g, 452, 318, 12, '#c8a86a', 4);
        ring(g, 452, 318, 7.5, '#b8975a', 3.5);
        ring(g, 452, 318, 3.5, '#c8a86a', 3);
      },
    },
    {
      id: 'wake', x: 280, y: 396, r: 46, label: 'the wake',
      paint(g, v, rng) {
        g.strokeStyle = 'rgba(255,255,255,0.75)';
        g.lineCap = 'round';
        const trails = v === 0 ? [-70, -34, 0, 34, 70] : [-16, 16];
        for (const off of trails) {
          g.lineWidth = 3.5;
          g.beginPath();
          g.moveTo(280 + off * 0.4, 380);
          g.quadraticCurveTo(280 + off * 0.8, 392, 280 + off, 402 + rng() * 6);
          g.stroke();
        }
        if (v === 0) seaSparkle(g, rng, 384, 410, 10, 'rgba(255,255,255,0.6)');
      },
    },
  ],
};

/* ================================================================== */
/* Scene 4 — The Tide Pools                                           */
/* ================================================================== */

const pools = {
  id: 'pools',
  title: 'The Tide Pools',
  tagline: 'The tide is out and the pools are full of small tenants. Eight changes.',
  diffs: 8,
  time: 135,
  paintBase(g, rng) {
    g.fillStyle = skyGradient(g, [[0, '#a5d3e8'], [1, '#e6f2e2']], 150);
    g.fillRect(0, 0, PANEL_W, 150);
    // the sea, a bright strip behind the rocks
    g.fillStyle = '#3f88a8';
    g.fillRect(0, 128, PANEL_W, 42);
    seaSparkle(g, rng, 134, 162, 18, 'rgba(255,255,255,0.55)');
    // grassy cliff tops at both corners
    poly(g, [[0, 170], [0, 108], [70, 92], [128, 118], [140, 170]], '#6d9a58');
    poly(g, [[560, 170], [560, 104], [492, 90], [436, 116], [424, 170]], '#6d9a58');
    grassTuft(g, 44, 116, 14, '#4d7c4d', rng);
    grassTuft(g, 508, 112, 14, '#4d7c4d', rng);
    // rock slabs
    poly(g, [[0, 420], [0, 210], [120, 178], [300, 196], [330, 420]], '#8b8d90');
    poly(g, [[330, 420], [318, 220], [420, 186], [560, 214], [560, 420]], '#7c7e82');
    poly(g, [[0, 420], [0, 300], [180, 268], [420, 292], [560, 330], [560, 420]], '#9a9c9e');
    g.strokeStyle = 'rgba(60,60,66,0.35)';
    g.lineWidth = 2;
    for (const [x1, y1, x2, y2] of [[40, 260, 150, 240], [380, 250, 500, 236], [120, 340, 260, 322], [420, 330, 520, 350]]) {
      line(g, x1, y1, x2, y2, 'rgba(60,60,66,0.30)', 2);
    }
    // two tide pools
    oval(g, 182, 306, 86, 30, '#2f7d96');
    oval(g, 182, 302, 78, 25, '#45a3b8');
    oval(g, 408, 336, 74, 26, '#2f7d96');
    oval(g, 408, 332, 66, 21, '#45a3b8');
    // wet sand foreground
    poly(g, [[0, 420], [0, 386], [200, 366], [420, 378], [560, 396], [560, 420]], '#d9c49a');
  },
  elements: [
    {
      id: 'cliffKite', x: 446, y: 52, r: 26, label: 'the kite over the cliff',
      paint(g, v) {
        if (v !== 0) return;
        poly(g, [[446, 28], [466, 52], [446, 76], [426, 52]], '#c8433c');
        poly(g, [[446, 28], [466, 52], [446, 52]], '#e8a13a');
        g.strokeStyle = 'rgba(32,48,62,0.6)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(446, 76);
        g.quadraticCurveTo(436, 96, 446, 112);
        g.stroke();
        disc(g, 441, 90, 2.6, '#31556e');
        disc(g, 449, 102, 2.6, '#3f8f57');
      },
    },
    {
      id: 'snails', x: 62, y: 246, r: 22, label: 'the periwinkles',
      paint(g, v) {
        const spots = v === 0
          ? [[44, 240], [64, 232], [82, 244], [54, 254], [76, 258]]
          : [[46, 242], [68, 236], [80, 252]];
        for (const [x, y] of spots) {
          disc(g, x, y, 6, '#5a4a6e');
          disc(g, x - 1.5, y - 1.5, 2.4, '#8d7ba8');
        }
      },
    },
    {
      id: 'crab', x: 182, y: 262, r: 22, label: 'the crab',
      paint(g, v) {
        if (v !== 0) return;
        oval(g, 182, 266, 15, 10, '#d95f43');
        disc(g, 168, 252, 7, '#e8735a');
        disc(g, 196, 252, 7, '#e8735a');
        disc(g, 176, 259, 2, '#20303e');
        disc(g, 188, 259, 2, '#20303e');
        g.strokeStyle = '#d95f43';
        g.lineWidth = 3;
        for (const s of [-1, 1]) {
          for (let i = 0; i < 3; i++) {
            g.beginPath();
            g.moveTo(182 + s * 12, 270 + i * 2);
            g.lineTo(182 + s * (20 + i * 3), 276 + i * 4);
            g.stroke();
          }
        }
      },
    },
    {
      id: 'poolFish', x: 182, y: 302, r: 24, label: 'the fish in the pool',
      paint(g, v) {
        const fish = (x, y, flip) => {
          oval(g, x, y, 10, 4.5, '#f2c14e');
          poly(g, [[x - flip * 9, y], [x - flip * 15, y - 4], [x - flip * 15, y + 4]], '#f2c14e');
          disc(g, x + flip * 5, y - 1, 1.4, '#20303e');
        };
        fish(164, 300, 1);
        if (v === 0) fish(204, 310, -1);
      },
    },
    {
      id: 'seaweed', x: 272, y: 318, r: 20, label: 'the seaweed',
      paint(g, v, rng) {
        if (v !== 0) return;
        g.strokeStyle = '#3f7d4e';
        g.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
          const x = 258 + i * 6;
          const sway = (rng() - 0.5) * 10;
          g.lineWidth = 4;
          g.beginPath();
          g.moveTo(x, 330);
          g.quadraticCurveTo(x + sway, 314, x + sway * 1.6, 300 + rng() * 8);
          g.stroke();
          disc(g, x + sway * 1.6, 300 + rng() * 8, 3, '#4d995f');
        }
      },
    },
    {
      id: 'starfish', x: 408, y: 334, r: 17, label: 'the starfish',
      paint(g, v) {
        star(g, 408, 334, 14, v === 0 ? '#e07b39' : '#8d6fb8');
        disc(g, 408, 334, 3, 'rgba(255,255,255,0.55)');
        for (const [dx, dy] of [[-6, -4], [6, -4], [0, 7], [-7, 5], [7, 5]]) {
          disc(g, 408 + dx, 334 + dy, 1.5, 'rgba(255,255,255,0.5)');
        }
      },
    },
    {
      id: 'anemone', x: 466, y: 366, r: 16, label: 'the anemone',
      paint(g, v) {
        disc(g, 466, 372, 10, '#b84a6e');
        if (v === 0) {
          g.strokeStyle = '#e87a9c';
          g.lineWidth = 3;
          g.lineCap = 'round';
          for (let i = 0; i < 7; i++) {
            const a = Math.PI + (i / 6) * Math.PI;
            g.beginPath();
            g.moveTo(466, 368);
            g.lineTo(466 + Math.cos(a) * 11, 368 + Math.sin(a) * 9 - 2);
            g.stroke();
          }
        }
      },
    },
    {
      id: 'bucket', x: 508, y: 292, r: 21, label: 'the bucket',
      paint(g, v) {
        if (v === 0) {
          poly(g, [[492, 276], [524, 276], [519, 306], [497, 306]], '#c8433c');
          g.strokeStyle = '#8d8d90';
          g.lineWidth = 2.5;
          g.beginPath();
          g.arc(508, 276, 15, Math.PI, TAU);
          g.stroke();
          oval(g, 508, 276, 16, 4, '#e07b6e');
        } else {
          poly(g, [[494, 306], [524, 292], [530, 302], [500, 314]], '#c8433c');
          oval(g, 497, 309, 5, 9, '#e07b6e', 0.9);
        }
      },
    },
    {
      id: 'shells', x: 96, y: 384, r: 26, label: 'the shells on the sand',
      paint(g, v) {
        const shell = (x, y, s, c) => {
          g.fillStyle = c;
          g.beginPath();
          g.arc(x, y, s, Math.PI, TAU);
          g.closePath();
          g.fill();
          line(g, x, y, x - s * 0.6, y - s * 0.7, 'rgba(120,90,60,0.5)', 1.2);
          line(g, x, y, x + s * 0.6, y - s * 0.7, 'rgba(120,90,60,0.5)', 1.2);
        };
        shell(74, 388, 9, '#f2e3c8');
        shell(104, 380, 7, '#e8b4a0');
        shell(122, 392, 8, '#f2e3c8');
        if (v === 0) shell(90, 398, 6, '#c9d6e8');
      },
    },
    {
      id: 'spade', x: 330, y: 382, r: 17, label: 'the spade in the sand',
      paint(g, v) {
        if (v !== 0) return;
        line(g, 330, 356, 330, 380, '#8a683f', 4);
        roundRect(g, 323, 348, 14, 9, 3, '#c8433c');
        poly(g, [[322, 380], [338, 380], [334, 398], [326, 398]], '#b8bcc0');
      },
    },
  ],
};

/* ================================================================== */
/* Scene 5 — The Keeper's Room                                        */
/* ================================================================== */

const keeper = {
  id: 'keeper',
  title: "The Keeper's Room",
  tagline: 'Up in the lighthouse, between watches. Nine things have shifted.',
  diffs: 9,
  time: 130,
  paintBase(g, rng) {
    // plaster wall and wooden floor
    g.fillStyle = '#caa27a';
    g.fillRect(0, 0, PANEL_W, 336);
    g.fillStyle = '#a87f52';
    g.fillRect(0, 300, PANEL_W, 36);
    g.fillStyle = '#8a683f';
    g.fillRect(0, 336, PANEL_W, PANEL_H - 336);
    g.strokeStyle = 'rgba(90,60,30,0.4)';
    for (let y = 356; y < PANEL_H; y += 20) line(g, 0, y, PANEL_W, y, 'rgba(90,60,30,0.35)', 2);
    // ceiling beam
    roundRect(g, 0, 0, PANEL_W, 18, 0, '#6e4a2b');
    // the great round window, looking over the harbour
    disc(g, 150, 158, 86, '#31424f');
    disc(g, 150, 158, 76, '#7fb2d9');
    g.fillStyle = '#3a719b';
    g.fillRect(74, 158, 152, 76);
    seaSparkle(g, rng, 190, 224, 8, 'rgba(255,255,255,0.5)');
    poly(g, [[74, 196], [120, 178], [226, 190], [226, 234], [74, 234]], '#5d7d94');
    line(g, 150, 82, 150, 234, '#31424f', 5);
    line(g, 74, 158, 226, 158, '#31424f', 5);
    // a shelf on the right wall (its books are an element)
    roundRect(g, 428, 100, 118, 8, 3, '#6e4a2b');
    line(g, 440, 108, 440, 122, '#6e4a2b', 4);
    line(g, 534, 108, 534, 122, '#6e4a2b', 4);
    // the desk, right side (map, mug and lamp are elements)
    roundRect(g, 300, 284, 246, 14, 4, '#77572f');
    roundRect(g, 312, 298, 12, 62, 3, '#6e4a2b');
    roundRect(g, 520, 298, 12, 62, 3, '#6e4a2b');
    roundRect(g, 330, 306, 60, 40, 3, '#6e4a2b');
    // the stove, bottom left (the kettle's steam is an element)
    roundRect(g, 38, 300, 76, 66, 6, '#31424f');
    disc(g, 76, 322, 17, '#22303c');
    disc(g, 76, 322, 11, '#e07b39');
    line(g, 100, 300, 100, 238, '#31424f', 9);
    // the rug (its cat is an element)
    oval(g, 210, 356, 92, 26, '#a03d38');
    oval(g, 210, 356, 70, 18, '#c89b3c');
    oval(g, 210, 356, 46, 11, '#a03d38');
  },
  elements: [
    {
      id: 'shelfBooks', x: 486, y: 82, r: 32, label: 'the books on the shelf',
      paint(g, v) {
        const books = [
          [436, 26, '#a03d38'], [454, 32, '#31556e'], [474, 24, '#3f8f57'],
          [492, 30, '#c89b3c'], [512, 25, '#7a4a6e'],
        ];
        const n = v === 0 ? 5 : 4;
        for (let i = 0; i < n; i++) {
          const [x, h, c] = books[i];
          roundRect(g, x, 100 - h, 16, h, 2, c);
          line(g, x + 3, 100 - h + 6, x + 13, 100 - h + 6, 'rgba(255,255,255,0.5)', 2);
        }
      },
    },
    {
      id: 'wallClock', x: 352, y: 84, r: 22, label: 'the wall clock',
      paint(g, v) {
        disc(g, 352, 84, 20, '#6e4a2b');
        disc(g, 352, 84, 16, '#f7f2df');
        const [ha, ma] = v === 0 ? [6.18, 2.1] : [7.68, 8.4];
        line(g, 352, 84, 352 + Math.cos(ha) * 8, 84 + Math.sin(ha) * 8, '#31424f', 3);
        line(g, 352, 84, 352 + Math.cos(ma) * 12, 84 + Math.sin(ma) * 12, '#31424f', 2);
        disc(g, 352, 84, 2.4, '#c8433c');
      },
    },
    {
      id: 'hangingLantern', x: 288, y: 128, r: 18, label: 'the hanging lantern',
      paint(g, v) {
        line(g, 288, 18, 288, 106, '#31424f', 3);
        roundRect(g, 276, 106, 24, 32, 5, '#31424f');
        if (v === 0) {
          roundRect(g, 281, 112, 14, 20, 3, '#ffd35c');
          disc(g, 288, 122, 20, 'rgba(255,211,92,0.28)');
        } else {
          roundRect(g, 281, 112, 14, 20, 3, '#5d7484');
        }
      },
    },
    {
      id: 'windowBoat', x: 150, y: 196, r: 34, label: 'the boat outside the window',
      paint(g, v) {
        if (v !== 0) return;
        poly(g, [[118, 210], [168, 210], [160, 222], [126, 222]], '#7a3b2e');
        line(g, 143, 210, 143, 182, '#4a3423', 3);
        poly(g, [[146, 184], [146, 208], [164, 208]], '#fbf7ea');
      },
    },
    {
      id: 'kettleSteam', x: 76, y: 258, r: 20, label: "the kettle's steam",
      paint(g, v) {
        // the kettle itself, both variants
        oval(g, 76, 292, 20, 13, '#5d7484');
        poly(g, [[58, 288], [48, 278], [60, 280]], '#5d7484');
        g.strokeStyle = 'rgba(255,255,255,0.85)';
        g.lineCap = 'round';
        const curls = v === 0 ? [-10, 0, 10] : [0];
        for (const off of curls) {
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(76 + off, 272);
          g.quadraticCurveTo(70 + off, 258, 78 + off, 246);
          g.stroke();
        }
      },
    },
    {
      id: 'deskLamp', x: 452, y: 244, r: 19, label: 'the desk lamp flame',
      paint(g, v) {
        roundRect(g, 438, 262, 28, 8, 3, '#8a6d1f');
        roundRect(g, 448, 240, 8, 24, 3, '#8a6d1f');
        disc(g, 452, 232, 11, 'rgba(255,190,80,0.30)');
        const h = v === 0 ? 17 : 8;
        poly(g, [[446, 240], [452, 240 - h], [458, 240]], '#ffb84d');
        disc(g, 452, 236, 3, '#fff2c8');
      },
    },
    {
      id: 'mapMark', x: 368, y: 292, r: 25, label: 'the mark on the chart',
      paint(g, v) {
        roundRect(g, 330, 282, 76, 22, 2, '#efe6cc');
        g.strokeStyle = 'rgba(90,130,160,0.7)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(338, 296);
        g.quadraticCurveTo(360, 284, 384, 294);
        g.quadraticCurveTo(396, 298, 400, 290);
        g.stroke();
        disc(g, 352, 290, 2.4, '#7aa5bd');
        disc(g, 388, 296, 2.4, '#7aa5bd');
        if (v === 0) {
          line(g, 366, 286, 378, 298, '#c8433c', 3);
          line(g, 378, 286, 366, 298, '#c8433c', 3);
        }
      },
    },
    {
      id: 'deskMug', x: 508, y: 272, r: 13, label: 'the mug',
      paint(g, v) {
        roundRect(g, 499, 262, 17, 20, 3, v === 0 ? '#c8433c' : '#31556e');
        g.strokeStyle = v === 0 ? '#c8433c' : '#31556e';
        g.lineWidth = 3;
        g.beginPath();
        g.arc(519, 272, 6, -Math.PI / 2, Math.PI / 2);
        g.stroke();
      },
    },
    {
      id: 'rugCat', x: 210, y: 350, r: 27, label: 'the cat on the rug',
      paint(g, v) {
        if (v !== 0) return;
        oval(g, 210, 354, 24, 11, '#4a4a52');
        disc(g, 230, 348, 9, '#4a4a52');
        poly(g, [[224, 342], [222, 334], [229, 338]], '#4a4a52');
        poly(g, [[234, 342], [237, 334], [230, 338]], '#4a4a52');
        g.strokeStyle = '#4a4a52';
        g.lineWidth = 5;
        g.beginPath();
        g.arc(186, 350, 10, Math.PI * 0.2, Math.PI * 1.2);
        g.stroke();
        line(g, 224, 348, 228, 348, '#ffd97a', 1.6);
      },
    },
  ],
};

/* ================================================================== */
/* Scene 6 — Harbour at Night                                         */
/* ================================================================== */

const night = {
  id: 'night',
  title: 'Harbour at Night',
  tagline: 'The same harbour, asleep under the stars. Nine last changes.',
  diffs: 9,
  time: 125,
  paintBase(g, rng) {
    g.fillStyle = skyGradient(g, [[0, '#0a1830'], [0.7, '#14304e'], [1, '#1d425f']], 260);
    g.fillRect(0, 0, PANEL_W, 260);
    // a field of small stars, seeded so both panels agree
    for (let i = 0; i < 70; i++) {
      const x = rng() * PANEL_W;
      const y = rng() * 190;
      disc(g, x, y, rng() * 1.3 + 0.4, 'rgba(255,255,255,0.75)');
    }
    // sea
    g.fillStyle = '#122e47';
    g.fillRect(0, 250, PANEL_W, 108);
    seaSparkle(g, rng, 262, 344, 26, 'rgba(190,220,255,0.30)');
    // rocks and the lighthouse, night edition (its lamp is an element)
    poly(g, [[0, 358], [0, 298], [52, 274], [128, 290], [150, 358]], '#232d38');
    poly(g, [[58, 300], [104, 300], [98, 150], [64, 150]], '#4d4a44');
    poly(g, [[62, 262], [101, 262], [99, 226], [64, 226]], '#6e2f2a');
    poly(g, [[66, 190], [97, 190], [95, 158], [68, 158]], '#6e2f2a');
    roundRect(g, 56, 128, 50, 14, 4, '#1c262f');
    // quay
    g.fillStyle = '#2a3540';
    g.fillRect(0, 358, PANEL_W, PANEL_H - 358);
    g.fillStyle = '#3a4753';
    g.fillRect(0, 358, PANEL_W, 6);
    // moored boats, silhouettes (their cabin lights are an element)
    for (const [x, y, s] of [[206, 318, 1], [318, 330, 0.8], [420, 316, 0.9]]) {
      poly(g, [[x - 46 * s, y], [x + 46 * s, y], [x + 34 * s, y + 17 * s], [x - 34 * s, y + 17 * s]], '#0c1622');
      roundRect(g, x - 13 * s, y - 15 * s, 27 * s, 15 * s, 3, '#0c1622');
      line(g, x - 26 * s, y, x - 26 * s, y - 52 * s, '#0c1622', 3);
    }
    // harbour houses along the quay (their lit windows are an element)
    roundRect(g, 372, 272, 62, 86, 3, '#1a2634');
    poly(g, [[366, 274], [403, 248], [440, 274]], '#101a26');
    roundRect(g, 448, 284, 52, 74, 3, '#1a2634');
    poly(g, [[442, 286], [474, 262], [506, 286]], '#101a26');
    roundRect(g, 510, 292, 44, 66, 3, '#1a2634');
    // lamp posts along the quay (their glow is an element)
    lampPost(g, 190, 360, 46);
    lampPost(g, 300, 360, 46);
    lampPost(g, 352, 360, 46);
    // a mooring post at the right end of the quay (its owl is an element)
    roundRect(g, 524, 322, 10, 38, 3, '#1c262f');
  },
  elements: [
    {
      id: 'moon', x: 472, y: 62, r: 28, label: 'the moon',
      paint(g, v) {
        if (v === 0) {
          crescent(g, 472, 62, 24, '#f4ead0');
        } else {
          disc(g, 472, 62, 24, '#f4ead0');
          disc(g, 464, 54, 5, 'rgba(190,180,150,0.6)');
          disc(g, 480, 70, 4, 'rgba(190,180,150,0.6)');
          disc(g, 472, 62, 34, 'rgba(244,234,208,0.16)');
        }
      },
    },
    {
      id: 'starCluster', x: 330, y: 66, r: 32, label: 'the bright cluster',
      paint(g, v) {
        const pts = [[306, 52], [326, 40], [348, 50], [318, 72], [342, 78], [360, 66]];
        const n = v === 0 ? 6 : 4;
        for (let i = 0; i < n; i++) {
          star(g, pts[i][0], pts[i][1], 5.5, '#ffeeb8');
        }
      },
    },
    {
      id: 'shootingStar', x: 176, y: 56, r: 28, label: 'the shooting star',
      paint(g, v) {
        if (v !== 0) return;
        line(g, 128, 78, 196, 40, 'rgba(255,255,255,0.85)', 2.5);
        line(g, 150, 70, 198, 42, 'rgba(255,255,255,0.4)', 4);
        sparkle(g, 200, 38, 8, '#ffffff');
      },
    },
    {
      id: 'beam', x: 84, y: 114, r: 30, label: 'the lighthouse beam',
      paint(g, v) {
        roundRect(g, 68, 100, 26, 26, 4, '#1c262f');
        disc(g, 81, 113, 8, '#ffe9a0');
        disc(g, 81, 113, 14, 'rgba(255,233,160,0.35)');
        if (v === 0) {
          poly(g, [[92, 105], [300, 66], [300, 118], [92, 121]], 'rgba(255,233,160,0.30)');
        } else {
          poly(g, [[92, 105], [262, 150], [236, 190], [92, 121]], 'rgba(255,233,160,0.30)');
        }
      },
    },
    {
      id: 'houseWindows', x: 462, y: 306, r: 42, label: 'the lit windows',
      paint(g, v) {
        const wins = [
          [388, 288], [410, 288], [388, 316], [410, 316],
          [462, 300], [480, 300], [462, 326],
          [522, 306], [538, 306], [522, 330],
        ];
        const litCount = v === 0 ? 7 : 4;
        wins.forEach(([x, y], i) => {
          roundRect(g, x, y, 11, 14, 2, i < litCount ? '#ffca6a' : '#0c141f');
        });
      },
    },
    {
      id: 'boatLights', x: 312, y: 306, r: 48, label: 'the cabin lights',
      paint(g, v) {
        const boats = [[206, 306], [318, 318], [420, 304]];
        boats.forEach(([x, y], i) => {
          const lit = v === 0 || i !== 1;
          if (lit) {
            disc(g, x, y, 4, '#ffd35c');
            disc(g, x, y, 9, 'rgba(255,211,92,0.35)');
          } else {
            disc(g, x, y, 4, '#233140');
          }
        });
      },
    },
    {
      id: 'quayLamps', x: 272, y: 308, r: 44, label: 'the quay lamps',
      paint(g, v) {
        const posts = [190, 300, 352];
        posts.forEach((x, i) => {
          const lit = v === 0 || i !== 1;
          roundRect(g, x - 8, 298, 16, 20, 3, '#131c26');
          if (lit) {
            roundRect(g, x - 4.5, 302, 9, 12, 2, '#ffd35c');
            disc(g, x, 308, 17, 'rgba(255,211,92,0.28)');
          } else {
            roundRect(g, x - 4.5, 302, 9, 12, 2, '#3d4c5c');
          }
        });
      },
    },
    {
      id: 'lampReflection', x: 300, y: 380, r: 22, label: "the lamp's reflection",
      paint(g, v, rng) {
        g.strokeStyle = 'rgba(255,211,92,0.55)';
        g.lineCap = 'round';
        const rows = v === 0 ? 6 : 2;
        for (let i = 0; i < rows; i++) {
          const y = 366 + i * 8;
          const w = 16 - i * 1.6 + rng() * 4;
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(300 - w / 2, y);
          g.lineTo(300 + w / 2, y);
          g.stroke();
        }
      },
    },
    {
      id: 'quayOwl', x: 529, y: 306, r: 17, label: 'the owl on the post',
      paint(g, v) {
        if (v !== 0) return;
        oval(g, 529, 308, 9, 12, '#5d4a38');
        disc(g, 529, 295, 7.5, '#6d5844');
        poly(g, [[523, 290], [521, 284], [527, 287]], '#5d4a38');
        poly(g, [[535, 290], [537, 284], [531, 287]], '#5d4a38');
        disc(g, 526, 295, 2.6, '#ffd35c');
        disc(g, 532, 295, 2.6, '#ffd35c');
        disc(g, 526, 295, 1.2, '#131313');
        disc(g, 532, 295, 1.2, '#131313');
      },
    },
  ],
};

/* ================================================================== */

export const SCENES = [dawn, market, ferry, pools, keeper, night];

/** Every difference in the game: 7 + 8 + 8 + 9 + 9 + 9 = 50. */
export const TOTAL_DIFFS = SCENES.reduce((n, s) => n + s.diffs, 0);
