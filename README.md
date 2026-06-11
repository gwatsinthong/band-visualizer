# SEGFAULT // Kernel Panic — Metal Band Visualizer

A Synthesia-style falling-notes visualizer, but for a **full metal band** instead of a piano —
rhythm guitar, lead guitar, bass, and drums. No vocals, no samples, no dependencies:
the song and every instrument sound are synthesized live in the browser with the Web Audio API,
and an animated character for each instrument performs on stage in sync with the notes.

![visualizer](shot-lead.png)

## Run it

It's plain static files — no build step, no dependencies. Either:

- **Just open it:** double-click `index.html` (it runs fine over `file://`), or
- **Serve it:** `npm run dev`, then open the printed URL (http://localhost:5173).
  The dev server is a tiny zero-dependency Node script, so there's nothing to `npm install`.

Then click play. Turn it up. 🤘

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

## The band

Each instrument has a character on stage, animated entirely from the note data:

- **Guitarists & bassist** — strum on every hit, their fret hand slides along the neck to
  follow the pitch being played, and they headbang on the beat (harder after chord stabs).
  The lead guitarist leans back during sustained vibrato notes.
- **Drummer** — sits behind a drawn kit (kick / snare / hi-hat / tom / crash). The falling
  drum notes land on the actual kit pieces, the sticks swing to whichever piece was hit,
  and the kick flashes on the double-kick runs.

## How it works

- **Composition** — the song is written as step-sequencer data (16th-note grid at 160 BPM)
  in `app.js`, built up from riff/beat helper functions.
- **Sound** — guitars and bass are **Karplus-Strong plucked strings** (palm mutes are
  heavily damped, open chords ring) fed through a tanh `WaveShaperNode` amp with a cab-sim
  EQ (mid scoop, presence peak, high rolloff). Drums are tuned sine drops with noise
  transients; hats and crash are banks of inharmonic square waves (808-style); snare,
  toms, cymbals and lead get a generated-impulse-response convolver reverb.
- **Visuals** — a single `<canvas>` renders the falling notes (lookahead of 2.4 s), moving
  beat grid, hit-line sparks, pulsing spotlights, and the four performers.
- **Sync** — audio is scheduled with the standard Web Audio lookahead-scheduler pattern, and
  both the renderer and the characters derive their state from `AudioContext.currentTime`,
  so audio, notes, and animation can't drift.

## Controls

- **Space / ⏸ button** — play / pause
- **⏮** — restart
- **LOOP** — toggle looping
- **VOL** — master volume
