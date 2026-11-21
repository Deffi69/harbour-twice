// draw.js — small canvas drawing helpers shared by every scene painter.
// All coordinates live in the panel's own 560x420 space.

export const PANEL_W = 560;
export const PANEL_H = 420;
export const TAU = Math.PI * 2;

/** A filled circle. */
export function disc(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
}

/** A stroked circle (the ring a found difference wears). */
export function ring(g, x, y, r, stroke, width) {
  g.strokeStyle = stroke;
  g.lineWidth = width;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.stroke();
}

/** A filled ellipse. */
export function oval(g, x, y, rx, ry, fill, rot = 0) {
  g.fillStyle = fill;
  g.beginPath();
  g.ellipse(x, y, rx, ry, rot, 0, TAU);
  g.fill();
}

/** A straight line with round caps. */
export function line(g, x1, y1, x2, y2, stroke, width) {
  g.strokeStyle = stroke;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

/** A filled polygon from a list of [x, y] points. */
export function poly(g, points, fill) {
  g.fillStyle = fill;
  g.beginPath();
  points.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
  g.closePath();
  g.fill();
}

/** A rounded rectangle path (not filled, so callers can fill or stroke). */
export function roundRectPath(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y);
  g.arcTo(x + w, y, x + w, y + r, r);
  g.lineTo(x + w, y + h - r);
  g.arcTo(x + w, y + h, x + w - r, y + h, r);
  g.lineTo(x + r, y + h);
  g.arcTo(x, y + h, x, y + h - r, r);
  g.lineTo(x, y + r);
  g.arcTo(x, y, x + r, y, r);
  g.closePath();
}

/** A filled rounded rectangle. */
export function roundRect(g, x, y, w, h, r, fill) {
  roundRectPath(g, x, y, w, h, r);
  g.fillStyle = fill;
  g.fill();
}

/** A five-pointed star, one point up. */
export function star(g, x, y, r, fill, rot = -Math.PI / 2) {
  g.fillStyle = fill;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = rot + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
}

/** A crescent moon: a disc with a bite taken out of it. */
export function crescent(g, x, y, r, fill, bite = 0.42) {
  g.save();
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.arc(x + r * bite, y - r * 0.28, r * 0.86, 0, TAU);
  g.fill();
  g.restore();
}

/** A soft cloud made of overlapping puffs, seeded so both panels agree. */
export function cloud(g, x, y, s, fill, rng) {
  g.fillStyle = fill;
  const puffs = 5;
  for (let i = 0; i < puffs; i++) {
    const px = x + (i - (puffs - 1) / 2) * s * 0.52;
    const py = y + (rng() - 0.5) * s * 0.22;
    const pr = s * (0.55 + rng() * 0.3);
    g.beginPath();
    g.arc(px, py, pr, 0, TAU);
    g.fill();
  }
  roundRect(g, x - s * 1.25, y - s * 0.1, s * 2.5, s * 0.62, s * 0.3, fill);
}

/** A tuft of grass: a few blades leaning at seeded angles. */
export function grassTuft(g, x, y, s, fill, rng) {
  g.strokeStyle = fill;
  g.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const lean = (rng() - 0.5) * s * 0.9;
    const h = s * (0.7 + rng() * 0.6);
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x + (i - 2) * 3, y);
    g.quadraticCurveTo(x + (i - 2) * 3 + lean * 0.4, y - h * 0.6, x + (i - 2) * 3 + lean, y - h);
    g.stroke();
  }
}

/** A four-point sparkle, the kind cartoons put on shiny things. */
export function sparkle(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}

/** Vertical linear gradient helper for skies and water. */
export function skyGradient(g, stops, h = PANEL_H) {
  const grad = g.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) grad.addColorStop(at, color);
  return grad;
}
