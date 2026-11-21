# Harbour Twice — spot-the-difference: 6 scenes, 50 differences, magnifier + keyboard

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Deffi69/harbour-twice/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Deffi69/harbour-twice/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A make.fun `best-spot-the-difference-game-20261121-0451` entry:
**[▶ Play it in your browser](https://deffi69.github.io/harbour-twice/game/)** — no install, no network calls, everything drawn in code.

One harbour, drawn twice — and the second drawing is quietly wrong.
Every scene is painted twice from the same seed by the game's own
canvas code, so the two panels agree on everything except the chosen
differences: a lamp that went out, a buoy that changed colour, a cat
that left the window. Find them all before the light fades.

## The voyage — 6 scenes, 50 differences

| # | Scene | Differences | Time |
|---|-------|-------------|------|
| 1 | Harbour at Dawn | 7 | 2:30 |
| 2 | The Fish Market | 8 | 2:25 |
| 3 | The Ferry Deck | 8 | 2:20 |
| 4 | The Tide Pools | 8 | 2:15 |
| 5 | The Keeper's Room | 9 | 2:10 |
| 6 | Harbour at Night | 9 | 2:05 |

Each scene hides its differences in a pool of ten candidate changes,
re-drawn every attempt — no two playthroughs of a scene are the same.

## How to play

- **Click** a difference in either panel. Found differences get a
  brass ring and a check; a running counter shows how many remain.
- **Scoring** — 100 points per find, +15 for each step of a streak.
  Finishing a scene pays 2 points per second left on the clock.
- **False alarms** — a wrong click costs 25 points and 5 seconds.
  Five false alarms (or an empty clock) ends the scene; retry it with
  a fresh set of differences.
- **Hints** — 3 per scene; a hint pulses a ring around one unfound
  difference and costs 100 points.
- **Magnifier** — press the Magnifier button or `M` for a brass-rimmed
  lens that shows the picture at 1.9×, for the truly tiny treasons.
- **Keyboard play** — arrow keys steer a crosshair (hold `Shift` for
  bigger steps), `Enter` or `Space` checks the spot. `H` hint,
  `M` magnifier, `P` pause, `S` sound, `R` restart scene.
- **Sound** — every find, miss, hint and tick is synthesized live with
  WebAudio. No audio files.

## Run it

Play locally: serve the `game/` folder with any static server, e.g.

```sh
cd game && python3 -m http.server 8000   # then open http://localhost:8000
```

Hand in the entry (what the grader runs, Node 22, standard library only):

```sh
MAKEFUN_OUTPUT_DIR=/output node main.ts
```

This copies `game/` and `screenshots/` into the output directory and
writes `dossier.json` there with the vendored make.fun library. The
run is deterministic: same repository in, same bytes out.

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=eaffd4np&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
