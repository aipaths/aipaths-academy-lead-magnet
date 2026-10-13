---
name: AIPaths Graphite
colors:
  bg: "#101113"
  surface: "#17191c"
  surface-2: "#1e2125"
  line: "#2c3036"
  fg: "#eceef0"
  muted: "#9ba0a8"
  dim: "#878c95"
  signal: "#5ad48a"
typography:
  display: { family: "Montserrat", weight: 900, tracking: "-0.04em" }
  body: { family: "Montserrat", weight: 400 }
  data: { family: "JetBrains Mono", weight: [400, 700] }
  sizes: { hero: 168, headline: 104, body: 36, label: 24, chrome: 22 }
spacing:
  gutter-x: 120
  scene-padding: [170, 120, 160]
components:
  kicker: "mono 24/700, 0.12em tracking, number chip in fg on bg"
  chrome: "edge metadata in mono 22, hairlines at 104px, SMPTE timecode + REC dot"
  window: "surface card, 3px line border, 18px radius, title bar with three dots"
  rule: "3px line hairlines; signal bars only for the payoff"
motion:
  arrivals: "waterfall-entry — binary reveal, whip up, power4.out, overlap 1–2f"
  pops: "spring-pop-entrance — power3.out, no overshoot"
  transitions: "push slide 0.5s power3.inOut (primary); blur crossfade 0.6s for the close"
  ambient: "grid drifts one cell over the film; glow breathes (sine, low amplitude)"
audio:
  bed: "scripts/synth-bed.ts — 120 BPM A minor, cuts on beats, -11.5 LUFS source"
  sfx: "bundled media-use library, placed by measured onset/peak"
  target: "-14 LUFS integrated, ≤ -1 dBTP"
---

## Overview

AIPaths in motion: a graphite studio frame that shows the machine at work. Monochrome by
default; color is a signal, never decoration.

## The Frame

- Persistent chrome on every scene: brand left, spec right, live timecode bottom-left.
- Content anchors left; one focal block plus a supporting instrument (code, strip, table).

## Do

- Use `signal` only where it means "system / OK / now": playheads, PASS, attributes, the dot.
- Make numbers real and live (frame counters, timecode) — the video proves its own claim.
- Keep every frame a pure function of time: drivers + onUpdate, seeded randomness only.

## Don't

- No gradients on text, no neon, no orange/amber or indigo/cyan global accents.
- No exit animations except the final scene; the transition is the exit.
- No bouncy overshoot.
