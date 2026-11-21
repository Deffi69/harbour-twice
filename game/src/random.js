// random.js — a tiny seeded random number generator.
//
// Both panels of a scene must agree on every "random" detail (where the
// stars sit, how tall each grass tuft is) or the pictures would differ
// everywhere. So the game never calls Math.random while painting: every
// painter gets a generator seeded from the scene and the element name,
// and the two panels always produce the same stream.

/** Hash a string seed into a 32-bit integer (FNV-1a). */
export function hashSeed(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small, fast, deterministic PRNG. Returns values in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A generator seeded from any string, so painters can ask for "the observatory's stars". */
export function rngFrom(text) {
  return mulberry32(hashSeed(text));
}

/** Random float in [min, max). */
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

/** Random integer in [min, max], both ends included. */
export function intRange(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** One item of an array, chosen by the generator. */
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

/** A shuffled copy of an array (Fisher–Yates), the input left alone. */
export function shuffled(rng, items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
