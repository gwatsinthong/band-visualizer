# SEGFAULT // Kernel Panic — Metal Band Visualizer

A Synthesia-style falling-notes visualizer, but for a **full metal band** instead of a piano —
rhythm guitar, lead guitar, bass, and drums. No vocals, no samples, no dependencies:
the song and every instrument sound are synthesized live in the browser with the Web Audio API.

![visualizer](shot-lead.png)

## Run it

Open `index.html` in a browser (or serve the folder with `npx serve` / `python3 -m http.server`)
and click play. Turn it up. 🤘

## What you're looking at

Four columns of falling notes, each landing on its instrument's "deck" at the hit line:

| Column | Color | What it plays |
|---|---|---|
| Rhythm guitar | Amber | Palm-muted E-minor gallops, power-chord stabs, breakdown chugs |
| Lead guitar | Cyan | Melody with vibrato + slap-back delay, octave climax, closing run |
| Bass | Purple | Locked to the rhythm guitar's roots, an octave down |
| Drums | Red | Kick / snare / hi-hat / tom / crash lanes, double-kick sections |

The track itself is ~56 seconds (loops by default): intro build → main riff → lead section →
half-time breakdown → double-kick finale → ring-out.

## How it works

- **Composition** — the song is written as step-sequencer data (16th-note grid at 160 BPM)
  in `app.js`, built up from riff/beat helper functions.
- **Sound** — guitars are detuned dual sawtooth oscillators pushed through a `WaveShaperNode`
  "amp" (tanh clipping + tone stack); drums are tuned sine drops and filtered noise bursts;
  everything sums into a master compressor.
- **Visuals** — a single `<canvas>` renders the falling notes (lookahead of 2.4 s), moving
  beat grid, hit-line sparks, and per-instrument decks (strings light up where notes land,
  drum pads flash on hits).
- **Sync** — audio is scheduled with the standard Web Audio lookahead-scheduler pattern, and
  the renderer derives note positions from `AudioContext.currentTime`, so audio and visuals
  can't drift.

## Controls

- **Space / ⏸ button** — play / pause
- **⏮** — restart
- **LOOP** — toggle looping
- **VOL** — master volume
