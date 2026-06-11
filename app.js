'use strict';

/* ============================================================
 * SEGFAULT — "Kernel Panic"
 * A falling-notes visualizer for a full synthesized metal band:
 * rhythm guitar / lead guitar / bass / drums. No vocals.
 *
 * Sound: Karplus-Strong plucked strings through a waveshaper
 * amp + cab sim; physically-flavored drums (tuned sine drops,
 * metallic square-bank cymbals); generated-IR convolver reverb.
 *
 * Visuals: falling notes land on a stage where an animated
 * character per instrument performs in sync with the music.
 * ============================================================ */

/* ---------------- Song data ---------------- */

let BPM = 160;
let STEP = 60 / BPM / 4;  // one 16th note, in seconds (recomputed per song)
const BAR = 16;           // 16th-note steps per bar

// pitches (MIDI)
const E1 = 28, E2 = 40, G2 = 43, A2 = 45, Bb2 = 46, B2 = 47, C3 = 48, D3 = 50;

// note buffers for the song currently being built / played
let R = [], L = [], BS = [], DRm = [];

const rn = (s, m, d, o = {}) => R.push({ s, m, d, pm: !!o.pm, ch: !!o.ch, v: o.v || 1 });
const ln = (s, m, d) => L.push({ s, m, d });
const bn = (s, m, d) => BS.push({ s, m, d });
const dn = (s, p) => DRm.push({ s, p });

// classic gallop bar on the low E with a power-chord stab on beat 4
function riffA(bar, stab) {
  const o = bar * BAR;
  for (let beat = 0; beat < 3; beat++) {
    const t = o + beat * 4;
    rn(t, E2, 2, { pm: 1 });
    rn(t + 2, E2, 1, { pm: 1, v: 0.85 });
    rn(t + 3, E2, 1, { pm: 1, v: 0.85 });
  }
  for (let i = 0; i < 6; i++) bn(o + i * 2, E1, 2);
  if (stab != null) {
    rn(o + 12, stab, 4, { ch: 1, v: 1.1 });
    bn(o + 12, stab - 12, 4);
  }
}

function beatA(bar, crash) {
  const o = bar * BAR;
  [0, 2, 8, 10].forEach(s => dn(o + s, 'K'));
  [4, 12].forEach(s => dn(o + s, 'S'));
  for (let i = 0; i < 16; i += 2) dn(o + i, 'H');
  if (crash) dn(o, 'C');
}

function beatDK(bar, crash) { // double kick
  const o = bar * BAR;
  for (let i = 0; i < 16; i++) dn(o + i, 'K');
  [4, 12].forEach(s => dn(o + s, 'S'));
  [0, 4, 8, 12].forEach(s => dn(o + s, 'H'));
  if (crash) dn(o, 'C');
}

function tomFill(bar) {
  const o = bar * BAR;
  dn(o + 12, 'T'); dn(o + 13, 'T'); dn(o + 14, 'T'); dn(o + 15, 'S');
}

function halfTimeBeat(bar, crash) { // groovy half-time: snare on beat 3
  const o = bar * BAR;
  dn(o, 'K'); dn(o + 3, 'K'); dn(o + 6, 'K'); dn(o + 8, 'S'); dn(o + 11, 'K'); dn(o + 13, 'K');
  for (let i = 0; i < 16; i += 2) dn(o + i, 'H');
  if (crash) dn(o, 'C');
}

/* ===== Song 1: "Kernel Panic" — E minor, galloping thrash ===== */
function songKernelPanic() {
/* --- intro: 4 bars, palm-muted 8ths building up --- */
for (let bar = 0; bar < 3; bar++) {
  const o = bar * BAR;
  for (let i = 0; i < 8; i++) rn(o + i * 2, E2, 2, { pm: 1, v: i % 4 === 0 ? 1 : 0.75 });
  if (bar >= 2) {
    for (let i = 0; i < 8; i++) { bn(o + i * 2, E1, 2); dn(o + i * 2, 'H'); }
    dn(o, 'K'); dn(o + 8, 'K');
  }
}
{ // bar 3: walk up + snare roll into the main riff
  const o = 3 * BAR;
  for (let i = 0; i < 6; i++) { rn(o + i * 2, E2, 2, { pm: 1 }); bn(o + i * 2, E1, 2); dn(o + i * 2, 'H'); }
  rn(o + 12, G2, 2, { pm: 1 }); rn(o + 14, A2, 2, { pm: 1 });
  bn(o + 12, G2 - 12, 2); bn(o + 14, A2 - 12, 2);
  dn(o, 'K'); dn(o + 8, 'K');
  for (let i = 12; i < 16; i++) dn(o + i, 'S');
}

/* --- main riff: bars 4-11 --- */
const STABS = [G2, A2, G2, A2, C3, D3, C3, null];
for (let i = 0; i < 8; i++) {
  const bar = 4 + i;
  riffA(bar, STABS[i]);
  beatA(bar, i === 0);
}
{ // bar 11 beat 4: walk-up instead of a stab
  const o = 11 * BAR;
  rn(o + 12, G2, 2, { pm: 1 }); rn(o + 14, A2, 2, { pm: 1 });
  bn(o + 12, G2 - 12, 2); bn(o + 14, A2 - 12, 2);
}
tomFill(11);

/* --- lead section: bars 12-27, melody over the riff --- */
// melody phrase: [relative 16th step, midi, duration in steps]
const MEL = [
  [0, 76, 4], [4, 74, 2], [6, 71, 2], [8, 72, 4], [12, 71, 2], [14, 69, 2],
  [16, 71, 8], [24, 67, 4], [28, 69, 4],
  [32, 72, 4], [36, 71, 2], [38, 69, 2], [40, 71, 4], [44, 67, 4],
  [48, 69, 8], [56, 71, 4], [60, 72, 2], [62, 74, 2],
  [64, 76, 4], [68, 74, 2], [70, 71, 2], [72, 72, 4], [76, 74, 4],
  [80, 76, 6], [86, 74, 2], [88, 71, 8],
  [96, 72, 2], [98, 74, 2], [100, 76, 4], [104, 74, 2], [106, 72, 2], [108, 71, 2], [110, 69, 2],
  [112, 71, 2], [114, 69, 2], [116, 67, 2], [118, 66, 2], [120, 64, 8],
];

for (let i = 0; i < 16; i++) riffA(12 + i, STABS[i % 8] ?? C3);
// first pass: melody as written
for (const [rs, m, d] of MEL) ln(12 * BAR + rs, m, d);
// second pass: first half up an octave, then the same climb, ending in a fast run
for (const [rs, m, d] of MEL) {
  if (rs >= 112) continue;
  ln(20 * BAR + rs, rs < 64 ? m + 12 : m, d);
}
{ // bar 27: descending 16th run to close the solo
  const o = 27 * BAR;
  [76, 74, 72, 71, 69, 67, 66, 67].forEach((m, i) => ln(o + i, m, 1));
  ln(o + 8, 64, 8);
}
for (let i = 0; i < 8; i++) beatA(12 + i, i === 0);
tomFill(19);
for (let i = 0; i < 4; i++) beatA(20 + i, i === 0);
for (let i = 0; i < 4; i++) beatDK(24 + i, i === 0);
tomFill(27);

/* --- breakdown: bars 28-31, half-time syncopated chugs --- */
function chugBar(bar, stab) {
  const o = bar * BAR;
  const hits = [0, 3, 6, 8, 11];
  for (const h of hits) {
    rn(o + h, E2, 1, { pm: 1, v: 1.15 });
    bn(o + h, E1, 1);
    dn(o + h, 'K');
  }
  if (stab != null) {
    rn(o + 12, stab, 4, { ch: 1, v: 1.2 });
    bn(o + 12, stab - 12, 4);
    dn(o + 12, 'K');
  } else {
    rn(o + 14, E2, 1, { pm: 1, v: 1.15 });
    bn(o + 14, E1, 1);
    dn(o + 14, 'K');
  }
  dn(o, 'C');
  dn(o + 8, 'S'); // half-time backbeat
}
chugBar(28, null);
chugBar(29, C3);
chugBar(30, null);
chugBar(31, Bb2);

/* --- finale: bars 32-35 riff with double kick, bar 36 ring-out --- */
const FINAL_STABS = [G2, A2, C3, D3];
for (let i = 0; i < 4; i++) {
  riffA(32 + i, FINAL_STABS[i]);
  beatDK(32 + i, i === 0);
}
tomFill(35);
{
  const o = 36 * BAR;
  rn(o, E2, 16, { ch: 1, v: 1.2 });
  bn(o, E1, 16);
  ln(o, 76, 16);
  dn(o, 'K'); dn(o, 'C');
}

  return 37 * BAR;
}

/* ===== Song 2: "Null Pointer" — A minor, melodic speed metal ===== */
function songNullPointer() {
  const A1 = 33, E2 = 40, F2 = 41, G2 = 43, A2 = 45, C3 = 48;

  // straight palm-muted 8ths on a root
  const chug = (bar, root) => {
    const o = bar * BAR;
    for (let i = 0; i < 8; i++) rn(o + i * 2, root, 2, { pm: 1, v: i === 0 ? 1 : 0.82 });
    for (let i = 0; i < 8; i++) bn(o + i * 2, root - 12, 2);
  };
  // ringing power chord held across the bar
  const ring = (bar, root) => {
    const o = bar * BAR;
    rn(o, root, 15, { ch: 1, v: 1.05 });
    for (let i = 0; i < 8; i++) bn(o + i * 2, root - 12, 2);
  };

  const verse = [A2, A2, F2, G2, A2, A2, C3, E2];

  // intro (0-3): chug on A, drums build in
  for (let b = 0; b < 4; b++) {
    chug(b, A2);
    if (b >= 2) beatA(b, b === 2);
    else { dn(b * BAR, 'K'); dn(b * BAR + 8, 'K'); for (let i = 0; i < 16; i += 2) dn(b * BAR + i, 'H'); }
  }
  tomFill(3);

  // verse (4-11)
  for (let i = 0; i < 8; i++) { chug(4 + i, verse[i]); beatA(4 + i, i === 0); }
  tomFill(11);

  // chorus + lead (12-19): held chords with a soaring melody
  const chorus = [A2, A2, F2, G2, A2, C3, G2, E2];
  for (let i = 0; i < 8; i++) { ring(12 + i, chorus[i]); beatA(12 + i, i % 2 === 0); }
  const lead = [
    [0, 76, 4], [4, 77, 4], [8, 76, 2], [10, 74, 2], [12, 72, 4],
    [16, 74, 8], [24, 72, 4], [28, 71, 4],
    [32, 72, 4], [36, 74, 4], [40, 76, 4], [44, 72, 4],
    [48, 69, 12], [60, 71, 4],
    [64, 76, 4], [68, 77, 4], [72, 79, 4], [76, 77, 4],
    [80, 76, 8], [88, 74, 4], [92, 72, 4],
    [96, 74, 4], [100, 72, 4], [104, 71, 4], [108, 69, 4],
    [112, 71, 8], [120, 81, 8],
  ];
  for (const [s, m, d] of lead) ln(12 * BAR + s, m, d);

  // solo (20-27): continuous pentatonic run over a double-kick chug
  const sc = [69, 72, 74, 76, 79, 81, 79, 76]; // A minor pentatonic up/down
  for (let b = 0; b < 8; b++) {
    chug(20 + b, verse[b]);
    beatDK(20 + b, b === 0);
    for (let i = 0; i < 8; i++) ln((20 + b) * BAR + i * 2, sc[(i + b * 2) % sc.length] + (b >= 4 ? 12 : 0), 2);
  }
  tomFill(27);

  // outro (28-31) + ring-out (32)
  const out = [A2, F2, G2, A2];
  for (let i = 0; i < 4; i++) { ring(28 + i, out[i]); beatDK(28 + i, true); }
  ln(28 * BAR, 81, 16); ln(30 * BAR, 79, 8); ln(31 * BAR, 81, 16);
  { const o = 32 * BAR; rn(o, A2, 16, { ch: 1, v: 1.1 }); bn(o, A1, 16); ln(o, 81, 16); dn(o, 'K'); dn(o, 'C'); }
  return 33 * BAR;
}

/* ===== Song 3: "Stack Overflow" — E, half-time groove / breakdown ===== */
function songStackOverflow() {
  const E1 = 28, E2 = 40, Fs2 = 42, G2 = 43, A2 = 45, B2 = 47, C3 = 48;

  // syncopated palm-muted groove on a root
  const groove = (bar, root, pat) => {
    const o = bar * BAR;
    for (const s of pat) { rn(o + s, root, 1, { pm: 1, v: 1.15 }); bn(o + s, root - 12, 1); }
  };
  const patA = [0, 3, 4, 7, 8, 11, 14];
  const patB = [0, 2, 3, 6, 8, 11, 12, 14];
  const roots = [E2, E2, G2, Fs2, E2, A2, G2, Fs2];

  // intro (0-1): two big chord swells
  { rn(0, E2, 8, { ch: 1, v: 1.1 }); bn(0, E1, 8); dn(0, 'C'); dn(0, 'K');
    rn(BAR, G2, 8, { ch: 1, v: 1.1 }); bn(BAR, G2 - 12, 8); dn(BAR, 'C'); dn(BAR, 'K'); }

  // main groove (2-9)
  for (let i = 0; i < 8; i++) { groove(2 + i, roots[i], i % 2 ? patB : patA); halfTimeBeat(2 + i, i === 0); }
  tomFill(9);

  // melodic mid section (10-17): bluesy lead over the groove
  for (let i = 0; i < 8; i++) { groove(10 + i, roots[i], i % 2 ? patB : patA); halfTimeBeat(10 + i, i % 4 === 0); }
  const lead = [
    [0, 64, 6], [6, 67, 2], [8, 69, 8],
    [16, 71, 6], [22, 69, 2], [24, 67, 4], [28, 64, 4],
    [32, 71, 4], [36, 74, 4], [40, 76, 8], [48, 74, 4], [52, 71, 4], [56, 69, 8],
    [64, 67, 4], [68, 69, 4], [72, 71, 4], [76, 74, 4],
    [80, 76, 8], [88, 74, 4], [92, 71, 4], [96, 69, 8], [104, 67, 4], [108, 64, 4],
    [112, 64, 16],
  ];
  for (const [s, m, d] of lead) ln(10 * BAR + s, m, d);

  // breakdown (18-23): huge spaced chugs
  const bd = [E2, E2, C3, B2, E2, G2];
  for (let i = 0; i < 6; i++) {
    const o = (18 + i) * BAR;
    rn(o, bd[i], 3, { ch: 1, v: 1.3 }); bn(o, bd[i] - 12, 3);
    rn(o + 6, bd[i], 3, { pm: 1, v: 1.2 }); bn(o + 6, bd[i] - 12, 3);
    rn(o + 10, bd[i], 2, { pm: 1, v: 1.2 }); bn(o + 10, bd[i] - 12, 2);
    dn(o, 'C'); dn(o, 'K'); dn(o + 6, 'K'); dn(o + 8, 'S'); dn(o + 10, 'K'); dn(o + 13, 'K');
    for (let h = 0; h < 16; h += 4) dn(o + h, 'H');
  }
  tomFill(23);

  // outro groove + ring-out (24-27)
  for (let i = 0; i < 3; i++) { groove(24 + i, roots[i], patA); halfTimeBeat(24 + i, i === 0); }
  { const o = 27 * BAR; rn(o, E2, 16, { ch: 1, v: 1.25 }); bn(o, E1, 16); ln(o, 76, 16); dn(o, 'K'); dn(o, 'C'); }
  return 28 * BAR;
}

const SONGS = [
  { name: 'KERNEL PANIC',   sub: 'E MINOR · 160 BPM · GALLOPING THRASH',         bpm: 160, build: songKernelPanic },
  { name: 'NULL POINTER',   sub: 'A MINOR · 184 BPM · MELODIC SPEED METAL',      bpm: 184, build: songNullPointer },
  { name: 'STACK OVERFLOW', sub: 'E · 140 BPM · HALF-TIME GROOVE / BREAKDOWN',   bpm: 140, build: songStackOverflow },
];

/* ---------------- Track / visual note model ---------------- */

const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

// expand power chords into individual visual notes
function expandRhythm() {
  const out = [];
  for (const n of R) {
    const tones = n.ch ? [n.m, n.m + 7, n.m + 12] : [n.m];
    for (const m of tones) out.push({ t: n.s * STEP, d: n.d * STEP, m, pm: n.pm, acc: n.ch });
  }
  return out;
}

const DRUM_LABEL = { K: 'KICK', S: 'SNARE', H: 'HAT', T: 'TOM', C: 'CRASH' };
// where each drum lane sits across the column — matches the drawn kit
const KIT_FRAC = { H: 0.13, S: 0.32, K: 0.52, T: 0.68, C: 0.87 };

const TRACKS = [
  { name: 'RHYTHM GUITAR', color: '#f59e0b', glow: 'rgba(245,158,11,', notes: [], w: 0.29 },
  { name: 'LEAD GUITAR', color: '#22d3ee', glow: 'rgba(34,211,238,', notes: [], w: 0.29 },
  { name: 'BASS', color: '#a78bfa', glow: 'rgba(167,139,250,', notes: [], w: 0.2 },
  { name: 'DRUMS', color: '#f43f5e', glow: 'rgba(244,63,94,', notes: [], w: 0.22, drums: true },
];

let SONG_STEPS = 0, SONG_DUR = 0, LOOP_AT = 0, currentSong = 0;

// rebuild each track's visual notes from the current R/L/BS/DRm + STEP
function rebuildTracks() {
  TRACKS[0].notes = expandRhythm();
  TRACKS[1].notes = L.map(n => ({ t: n.s * STEP, d: n.d * STEP, m: n.m }));
  TRACKS[2].notes = BS.map(n => ({ t: n.s * STEP, d: n.d * STEP, m: n.m }));
  TRACKS[3].notes = DRm.map(n => ({ t: n.s * STEP, d: 0.08, p: n.p, acc: n.p === 'C' }));
  for (const tr of TRACKS) {
    tr.notes.sort((a, b) => a.t - b.t);
    tr._ptr = 0;
    tr._laneHit = {};
    tr._lastT = -1;
    tr._active = null;
    tr._lastHit = tr._accent = tr._lastNote = undefined;
    if (!tr.drums) {
      let lo = Infinity, hi = -Infinity;
      for (const n of tr.notes) { lo = Math.min(lo, n.m); hi = Math.max(hi, n.m); }
      tr.lo = lo - 1; tr.hi = hi + 1;
    }
  }
}

// build a song into R/L/BS/DRm and recompute timing/visuals
function loadSong(i) {
  currentSong = i;
  const s = SONGS[i];
  BPM = s.bpm; STEP = 60 / BPM / 4;
  R = []; L = []; BS = []; DRm = [];
  SONG_STEPS = s.build();
  SONG_DUR = SONG_STEPS * STEP;
  LOOP_AT = SONG_DUR + 1.2;
  if (chipEcho) chipEcho.delayTime.value = STEP * 3;
  rebuildTracks();
  updateSongHUD();
}

function updateSongHUD() {
  const s = SONGS[currentSong];
  const t = document.getElementById('songTitle');
  if (t) t.innerHTML = 'SEGFAULT <span>//</span> ' + s.name;
  const sub = document.getElementById('songSub');
  if (sub) sub.textContent = s.sub + ' · NO VOCALS';
  document.querySelectorAll('#tracks .trk').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.i) === currentSong);
  });
}

/* ============================================================
 * Audio engine
 * ============================================================ */

let ctx = null, master = null, busses = null, noiseBuf = null;
let hatBuf = null, crashBuf = null, reverbSend = null;
let PW25 = null; // 25%-duty pulse wave for the chip rhythm guitar
let chipEcho = null; // chip-lead delay node (retuned per song tempo)
let soundMode = 'chip'; // 'chip' (8-bit) or 'metal' (amp sim)

function distCurve(k) {
  const n = 2048, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(k * x);
  }
  return c;
}

/* --- guitar/bass amp: drive -> tanh clip -> cab sim EQ -> level --- */
function makeAmp({ drive, k, level, eq }) {
  const pre = ctx.createGain(); pre.gain.value = drive;
  const ws = ctx.createWaveShaper(); ws.curve = distCurve(k); ws.oversample = '4x';
  let node = ws;
  pre.connect(ws);
  for (const [type, freq, gain, q] of eq) {
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    if (gain != null) f.gain.value = gain;
    if (q != null) f.Q.value = q;
    node.connect(f); node = f;
  }
  const out = ctx.createGain(); out.gain.value = level;
  node.connect(out); out.connect(master);
  return { in: pre, out };
}

/* --- pre-rendered metallic cymbal content (sum of detuned squares + noise) --- */
function renderMetal(dur, freqs, noiseAmt) {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const ph = freqs.map(() => Math.random() * Math.PI * 2);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    let v = 0;
    for (let j = 0; j < freqs.length; j++) {
      v += Math.sin(2 * Math.PI * freqs[j] * t + ph[j]) > 0 ? 1 : -1;
    }
    d[i] = v / freqs.length + (Math.random() * 2 - 1) * noiseAmt;
  }
  return buf;
}

function makeReverb() {
  const sr = ctx.sampleRate, dur = 1.4;
  const len = Math.floor(sr * dur);
  const ir = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-3.2 * i / len);
    }
  }
  const conv = ctx.createConvolver(); conv.buffer = ir;
  const wet = ctx.createGain(); wet.gain.value = 0.55;
  const send = ctx.createGain(); send.gain.value = 1;
  send.connect(conv); conv.connect(wet); wet.connect(master);
  return send;
}

function initAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.ratio.value = 4;
  comp.attack.value = 0.003; comp.release.value = 0.25;
  comp.connect(ctx.destination);

  master = ctx.createGain();
  master.gain.value = parseFloat(document.getElementById('vol').value);
  master.connect(comp);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  // 808-style inharmonic partials for the hats; random shimmer bank for the crash
  hatBuf = renderMetal(0.4, [263, 400, 421, 474, 587, 845], 0.15);
  const crashFreqs = [];
  for (let i = 0; i < 14; i++) crashFreqs.push(900 + Math.random() * 5500);
  crashBuf = renderMetal(2.2, crashFreqs, 0.4);

  reverbSend = makeReverb();

  busses = {
    rhythm: makeAmp({
      drive: 2.8, k: 7, level: 0.34,
      eq: [
        ['highpass', 85, null, 0.7],
        ['peaking', 500, -7, 0.9],     // mid scoop
        ['peaking', 2400, 5, 1.1],     // presence bite
        ['lowpass', 5200, null, 0.7],
        ['lowpass', 6200, null, 0.7],  // cab rolloff
      ],
    }),
    lead: makeAmp({
      drive: 2.2, k: 5, level: 0.42,
      eq: [
        ['highpass', 220, null, 0.7],
        ['peaking', 1500, 3, 1],
        ['peaking', 3200, 4, 1.2],
        ['lowpass', 6000, null, 0.7],
      ],
    }),
    bass: makeAmp({
      drive: 1.7, k: 3, level: 0.5,
      eq: [
        ['highpass', 32, null, 0.7],
        ['peaking', 750, 4, 1],        // growl
        ['lowpass', 2400, null, 0.7],
      ],
    }),
    drums: (() => { const g = ctx.createGain(); g.gain.value = 0.8; g.connect(master); return { in: g }; })(),
  };

  // a touch of slap-back delay + room on the lead so it sings
  const dly = ctx.createDelay(1); dly.delayTime.value = 0.32;
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const wet = ctx.createGain(); wet.gain.value = 0.16;
  busses.lead.out.connect(dly); dly.connect(fb); fb.connect(dly);
  dly.connect(wet); wet.connect(master);
  const leadVerb = ctx.createGain(); leadVerb.gain.value = 0.2;
  busses.lead.out.connect(leadVerb); leadVerb.connect(reverbSend);

  /* --- chip (8-bit) busses: clean gains, softened top end --- */
  // 25%-duty pulse: imag[n] = (4/nπ)·sin(nπ·duty), band-limited to 32 harmonics
  const N = 32;
  const real = new Float32Array(N + 1), imag = new Float32Array(N + 1);
  for (let n = 1; n <= N; n++) imag[n] = (4 / (n * Math.PI)) * Math.sin(n * Math.PI * 0.25);
  PW25 = ctx.createPeriodicWave(real, imag);

  const chipBus = name => {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    const g = ctx.createGain(); g.gain.value = 1;
    g.connect(lp); lp.connect(master);
    busses[name] = g;
  };
  chipBus('chipR'); chipBus('chipL'); chipBus('chipB');

  // arcade echo on the chip lead
  const cdly = ctx.createDelay(1); cdly.delayTime.value = STEP * 3; chipEcho = cdly;
  const cfb = ctx.createGain(); cfb.gain.value = 0.3;
  const cwet = ctx.createGain(); cwet.gain.value = 0.22;
  busses.chipL.connect(cdly); cdly.connect(cfb); cfb.connect(cdly);
  cdly.connect(cwet); cwet.connect(master);
}

/* --- Karplus-Strong plucked string, cached per (pitch, duration, articulation) --- */
const ksCache = new Map();

function ksBuffer(midi, dur, { pm, tau, damp, pickLP }) {
  const key = `${midi}|${pm ? 1 : 0}|${Math.ceil(dur * 16)}|${tau}`;
  let buf = ksCache.get(key);
  if (buf) return buf;

  const sr = ctx.sampleRate;
  const f = midiHz(midi);
  const N = Math.round(sr / f);
  const total = pm ? Math.min(dur, 0.3) + 0.12 : dur + 0.45;
  const len = Math.max(Math.floor(sr * total), N * 2 + 8);
  buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);

  // pick excitation: one period of (optionally softened) noise
  let prev = 0;
  for (let i = 0; i < N; i++) {
    const w = Math.random() * 2 - 1;
    prev = pickLP * prev + (1 - pickLP) * w;
    d[i] = prev;
  }
  // pick-position comb (plucking near the bridge)
  const pp = Math.max(2, Math.floor(N * 0.12));
  for (let i = N - 1; i >= pp; i--) d[i] -= 0.55 * d[i - pp];

  // string loop: per-period decay from tau, damping blends in a 2-tap average
  const decay = Math.exp(-1 / (f * tau));
  for (let i = N + 1; i < len; i++) {
    d[i] = decay * ((1 - damp) * d[i - N] + damp * 0.5 * (d[i - N] + d[i - N - 1]));
  }
  // bake in a short fade-out so notes never click
  const fade = Math.min(Math.floor(sr * 0.06), len >> 2);
  for (let i = 0; i < fade; i++) d[len - 1 - i] *= i / fade;

  ksCache.set(key, buf);
  return buf;
}

function pluck(bus, t, midi, dur, { pm = false, vel = 1, vibrato = false, bass = false, lead = false } = {}) {
  const opts = pm
    ? { pm, tau: bass ? 0.11 : 0.055, damp: 0.6, pickLP: bass ? 0.6 : 0.3 }
    : { pm, tau: lead ? 2.4 : (bass ? 0.9 : 1.5), damp: lead ? 0.22 : 0.32, pickLP: bass ? 0.55 : 0.15 };
  const buf = ksBuffer(midi, dur, opts);

  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = 0.55 * vel;
  src.connect(g); g.connect(bus.in);

  if (vibrato) {
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.3;
    const lg = ctx.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(0.011, t + 0.45);
    lfo.connect(lg); lg.connect(src.playbackRate);
    lfo.start(t); lfo.stop(t + buf.duration);
  }
  src.start(t);
}

/* --- chip (8-bit) voices --- */
function chipPulse(bus, t, midi, dur, { wave = null, pm = false, vel = 1, vibrato = false } = {}) {
  const o = ctx.createOscillator();
  if (wave) o.setPeriodicWave(wave); else o.type = 'square';
  o.frequency.value = midiHz(midi);
  // tiny pitch blip on the attack for punch
  o.detune.setValueAtTime(45, t);
  o.detune.linearRampToValueAtTime(0, t + 0.03);

  const amp = 0.3 * vel;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.004);
  if (pm) { // staccato chug
    g.gain.setValueAtTime(amp, t + 0.05);
    g.gain.linearRampToValueAtTime(0, t + 0.09);
  } else {
    g.gain.setValueAtTime(amp, t + 0.05);
    g.gain.exponentialRampToValueAtTime(Math.max(amp * 0.35, 0.001), t + Math.max(dur, 0.12));
    g.gain.linearRampToValueAtTime(0, t + dur + 0.06);
  }

  if (vibrato) {
    const lfo = ctx.createOscillator(); lfo.frequency.value = 6;
    const lg = ctx.createGain();
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(22, t + 0.35); // cents
    lfo.connect(lg); lg.connect(o.detune);
    lfo.start(t); lfo.stop(t + dur + 0.1);
  }

  o.connect(g); g.connect(bus);
  o.start(t); o.stop(t + dur + 0.12);
}

function chipBassNote(t, midi, dur, vel = 1) {
  // NES-style triangle bass, played an octave up so it carries
  const o = ctx.createOscillator(); o.type = 'triangle';
  o.frequency.value = midiHz(midi + 12);
  const g = ctx.createGain();
  const amp = 0.65 * vel;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.004);
  g.gain.setValueAtTime(amp, t + Math.max(0.03, Math.min(dur, 0.16) - 0.03));
  g.gain.linearRampToValueAtTime(0, t + Math.min(dur, 0.18));
  o.connect(g); g.connect(busses.chipB);
  o.start(t); o.stop(t + dur + 0.05);
}

/* --- mode-aware note dispatchers (the schedule calls these) --- */
function playRhythm(at, m, dur, pm, vel) {
  if (soundMode === 'metal') pluck(busses.rhythm, at, m, dur, { pm, vel });
  else chipPulse(busses.chipR, at, m, dur, { wave: PW25, pm, vel });
}
function playLead(at, m, dur, vib) {
  if (soundMode === 'metal') pluck(busses.lead, at, m, dur, { lead: true, vibrato: vib });
  else chipPulse(busses.chipL, at, m, dur, { vel: 1.1, vibrato: vib });
}
function playBass(at, m, dur) {
  if (soundMode === 'metal') pluck(busses.bass, at, m, dur, { bass: true, pm: dur <= 2 * STEP });
  else chipBassNote(at, m, dur);
}

/* --- drums --- */
function noiseHit(t, { hpFreq, lpFreq, bpFreq, bpQ = 0.9, dur, gain, verb = 0 }) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  src.loop = true;
  let node = src;
  if (hpFreq) {
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hpFreq;
    node.connect(hp); node = hp;
  }
  if (lpFreq) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = lpFreq;
    node.connect(lp); node = lp;
  }
  if (bpFreq) {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = bpFreq; bp.Q.value = bpQ;
    node.connect(bp); node = bp;
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  node.connect(g); g.connect(busses.drums.in);
  if (verb) {
    const vs = ctx.createGain(); vs.gain.value = verb;
    g.connect(vs); vs.connect(reverbSend);
  }
  src.start(t); src.stop(t + dur + 0.05);
}

function metalHit(buf, t, { hpFreq, dur, gain, rate = 1, verb = 0 }) {
  const src = ctx.createBufferSource(); src.buffer = buf;
  src.playbackRate.value = rate;
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hpFreq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(hp); hp.connect(g); g.connect(busses.drums.in);
  if (verb) {
    const vs = ctx.createGain(); vs.gain.value = verb;
    g.connect(vs); vs.connect(reverbSend);
  }
  src.start(t); src.stop(t + dur + 0.05);
}

function tonalHit(t, { f0, f1, fallT, dur, gain, type = 'sine', verb = 0 }) {
  const o = ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + fallT);
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(busses.drums.in);
  if (verb) {
    const vs = ctx.createGain(); vs.gain.value = verb;
    g.connect(vs); vs.connect(reverbSend);
  }
  o.start(t); o.stop(t + dur + 0.05);
}

function drumHit(p, t) {
  if (soundMode === 'chip') return chipDrumHit(p, t);
  if (p === 'K') {
    tonalHit(t, { f0: 160, f1: 47, fallT: 0.07, dur: 0.24, gain: 1.05 });
    noiseHit(t, { hpFreq: 2000, dur: 0.02, gain: 0.5 });           // beater click
  } else if (p === 'S') {
    tonalHit(t, { f0: 210, f1: 165, fallT: 0.04, dur: 0.09, gain: 0.6, type: 'triangle' });
    noiseHit(t, { bpFreq: 1300, bpQ: 0.7, dur: 0.12, gain: 0.55 }); // shell crack
    noiseHit(t, { hpFreq: 3200, dur: 0.2, gain: 0.45, verb: 0.35 }); // wire rattle
  } else if (p === 'H') {
    metalHit(hatBuf, t, { hpFreq: 7800, dur: 0.055, gain: 0.4, rate: 1 + Math.random() * 0.04 });
  } else if (p === 'C') {
    metalHit(crashBuf, t, { hpFreq: 3800, dur: 1.6, gain: 0.55, rate: 0.96 + Math.random() * 0.08, verb: 0.3 });
  } else if (p === 'T') {
    tonalHit(t, { f0: 150, f1: 88, fallT: 0.16, dur: 0.32, gain: 0.85, verb: 0.25 });
    noiseHit(t, { hpFreq: 1500, dur: 0.02, gain: 0.25 });
  }
}

/* NES-noise-channel-style kit */
function chipDrumHit(p, t) {
  if (p === 'K') {
    tonalHit(t, { f0: 170, f1: 38, fallT: 0.05, dur: 0.13, gain: 1.0, type: 'triangle' });
    noiseHit(t, { lpFreq: 420, dur: 0.05, gain: 0.6 });
  } else if (p === 'S') {
    noiseHit(t, { bpFreq: 2200, bpQ: 0.5, dur: 0.05, gain: 0.6 });
    noiseHit(t, { hpFreq: 1200, dur: 0.11, gain: 0.45 });
  } else if (p === 'H') {
    noiseHit(t, { hpFreq: 9000, dur: 0.03, gain: 0.3 });
  } else if (p === 'C') {
    noiseHit(t, { hpFreq: 5500, dur: 0.6, gain: 0.45 });
  } else if (p === 'T') {
    tonalHit(t, { f0: 190, f1: 95, fallT: 0.1, dur: 0.16, gain: 0.7, type: 'square' });
  }
}

/* --- flat, time-sorted list of everything to play --- */
function buildSchedule() {
  const ev = [];
  for (const n of R) {
    const tones = n.ch ? [[n.m, 1], [n.m + 7, 0.8], [n.m + 12, 0.6]] : [[n.m, 1]];
    for (const [m, gv] of tones) {
      ev.push({ t: n.s * STEP, fire: at => playRhythm(at, m, n.d * STEP, n.pm, n.v * gv) });
    }
  }
  for (const n of L) {
    ev.push({ t: n.s * STEP, fire: at => playLead(at, n.m, n.d * STEP, n.d >= 6) });
  }
  for (const n of BS) {
    ev.push({ t: n.s * STEP, fire: at => playBass(at, n.m, n.d * STEP) });
  }
  for (const n of DRm) {
    ev.push({ t: n.s * STEP, fire: at => drumHit(n.p, at) });
  }
  ev.sort((a, b) => a.t - b.t);
  return ev;
}

/* ---------------- Transport ---------------- */

let schedule = null, schedIdx = 0, startCtxTime = 0, schedTimer = null;
let playing = false, started = false;

const songTime = () => ctx.currentTime - startCtxTime;

function schedulerTick() {
  if (!playing) return;
  const horizon = ctx.currentTime + 0.18;
  while (schedIdx < schedule.length && startCtxTime + schedule[schedIdx].t < horizon) {
    const ev = schedule[schedIdx];
    ev.fire(Math.max(startCtxTime + ev.t, ctx.currentTime + 0.005));
    schedIdx++;
  }
  if (schedIdx >= schedule.length && songTime() >= LOOP_AT) {
    if (document.getElementById('chkLoop').checked) {
      startCtxTime += LOOP_AT;
      schedIdx = 0;
      resetVisualNotes();
    } else {
      setPlaying(false);
      restart(false);
    }
  }
}

function resetVisualNotes() {
  for (const tr of TRACKS) for (const n of tr.notes) n.hit = false;
}

function setPlaying(on) {
  playing = on;
  document.getElementById('btnPlay').textContent = on ? '⏸' : '▶';
  if (ctx) (on ? ctx.resume() : ctx.suspend());
}

function restart(autoplay = true) {
  startCtxTime = ctx.currentTime + 0.4;
  schedIdx = 0;
  resetVisualNotes();
  particles.length = 0;
  if (autoplay) setPlaying(true);
}

function begin() {
  if (started) return;
  started = true;
  document.getElementById('start').style.display = 'none';
  initAudio();
  if (chipEcho) chipEcho.delayTime.value = STEP * 3;
  schedule = buildSchedule();
  startCtxTime = ctx.currentTime + 0.6;
  playing = true;
  schedTimer = setInterval(schedulerTick, 25);
  requestAnimationFrame(frame);
}

// switch tracks; rebuilds the song and (if playing) the audio schedule
function selectSong(i) {
  if (i === currentSong) return;
  loadSong(i);
  if (started) {
    schedule = buildSchedule();
    restart(true);
  }
}

/* ============================================================
 * Visualizer
 * ============================================================ */

const canvas = document.getElementById('stage');
const g2d = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  g2d.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const FALL = 2.4;       // seconds for a note to fall from top to the hit line
const particles = [];

function noteX(tr, n, colX, colW) {
  const pad = 14;
  if (tr.drums) {
    const x = colX + pad + KIT_FRAC[n.p] * (colW - pad * 2);
    return { x: x - 8, w: 16 };
  }
  const span = tr.hi - tr.lo;
  const laneW = (colW - pad * 2) / span;
  return { x: colX + pad + (n.m - tr.lo) * laneW, w: Math.max(6, laneW * 0.85) };
}

function spawnSparks(x, y, color, big) {
  const n = big ? 14 : 7;
  for (let i = 0; i < n; i++) {
    if (particles.length > 400) particles.shift();
    particles.push({
      x, y, color,
      vx: (Math.random() - 0.5) * (big ? 320 : 220),
      vy: -Math.random() * (big ? 360 : 260) - 40,
      life: 1,
    });
  }
}

function roundRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g2d.beginPath();
  g2d.moveTo(x + r, y);
  g2d.arcTo(x + w, y, x + w, y + h, r);
  g2d.arcTo(x + w, y + h, x, y + h, r);
  g2d.arcTo(x, y + h, x, y, r);
  g2d.arcTo(x, y, x + w, y, r);
  g2d.closePath();
}

/* ---------------- Performance state (drives the characters) ---------------- */

function updatePerf(tr, tNow) {
  if (tNow < tr._lastT - 0.25) { // looped or restarted
    tr._ptr = 0;
    tr._laneHit = {};
    tr._lastHit = tr._accent = undefined;
    tr._active = null;
  }
  tr._lastT = tNow;
  const ns = tr.notes;
  while (tr._ptr < ns.length && ns[tr._ptr].t <= tNow) {
    const n = ns[tr._ptr];
    tr._lastHit = n.t;
    tr._lastNote = n;
    if (n.acc) tr._accent = n.t;
    if (tr.drums) tr._laneHit[n.p] = n.t;
    if (!tr.drums && n.t + n.d > tNow) tr._active = n;
    tr._ptr++;
  }
  if (tr._active && tr._active.t + tr._active.d <= tNow) tr._active = null;
}

const env = (tNow, t0, k) => (t0 === undefined ? 0 : Math.exp(-Math.max(tNow - t0, 0) * k));

/* ---------------- Character drawing ----------------
 * All characters are dark silhouettes with glowing accents in
 * their instrument's color, drawn with round-capped strokes.
 * `s` is a scale factor; poses are driven by the perf state. */

function strokeLine(pts, w, color, blur = 0, blurColor = null) {
  g2d.strokeStyle = color;
  g2d.lineWidth = w;
  g2d.lineCap = 'round';
  g2d.lineJoin = 'round';
  if (blur) { g2d.shadowBlur = blur; g2d.shadowColor = blurColor || color; }
  g2d.beginPath();
  g2d.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g2d.lineTo(pts[i][0], pts[i][1]);
  g2d.stroke();
  g2d.shadowBlur = 0;
}

function drawHead(x, y, r, ang, color, hair) {
  // skull
  g2d.fillStyle = '#222640';
  g2d.strokeStyle = color;
  g2d.lineWidth = 2.2;
  g2d.beginPath();
  g2d.arc(x, y, r, 0, Math.PI * 2);
  g2d.fill(); g2d.stroke();
  if (hair) {
    // long metal hair: strands sweeping back, following the headbang
    g2d.strokeStyle = color;
    g2d.lineWidth = 1.4;
    g2d.globalAlpha = 0.75;
    for (let i = 0; i < 4; i++) {
      // strands start at the back of the skull and sweep down-left
      const sx = x - r * (0.55 + i * 0.12);
      const sy = y - r * (0.75 - i * 0.3);
      const swing = hair.swing * (1 + i * 0.25);
      g2d.beginPath();
      g2d.moveTo(sx, sy);
      g2d.quadraticCurveTo(
        sx - hair.back * (8 + i * 3) + swing * 6,
        sy + 8 + i * 3,
        sx - hair.back * (11 + i * 4) + swing * 14,
        sy + hair.len + i * 4
      );
      g2d.stroke();
    }
    g2d.globalAlpha = 1;
  }
}

const BODY = '#3f4566';
let bodyGlow = '#ffffff'; // set per character before drawing

function bodyStroke(pts, w) {
  strokeLine(pts, w, BODY, 9, bodyGlow);
}

function drawLegs(cx, hipY, floorY, s, spread, bob) {
  bodyStroke([[cx - 1 * s, hipY], [cx - spread * s, hipY + (floorY - hipY) * 0.55 + bob], [cx - spread * 1.15 * s, floorY]], 5 * s);
  bodyStroke([[cx + 1 * s, hipY], [cx + spread * s, hipY + (floorY - hipY) * 0.55 + bob], [cx + spread * 1.15 * s, floorY]], 5 * s);
}

/* --- guitarist / bassist: shared rig, different instrument + feel --- */
function drawStringPlayer(tr, colX, colW, stageTop, floorY, tNow, kind) {
  bodyGlow = tr.color;
  const cx = colX + colW / 2;
  const s = (floorY - stageTop) / 132;

  const isBass = kind === 'bass';
  const isLead = kind === 'lead';
  const strum = env(tNow, tr._lastHit, 16);
  const accent = env(tNow, tr._accent, 3);
  const beat = (tNow / (STEP * 4)) % 1;

  // headbang: nodding on the beat, deeper after a chord stab / while chugging
  const playEnv = env(tNow, tr._lastHit, 2.5);
  const bangDepth = isBass ? 0.35 : 0.55 + accent * 0.7;
  const nodPhase = isBass ? ((tNow / (STEP * 8)) % 1) : beat;
  const bang = Math.pow(Math.max(Math.cos(nodPhase * Math.PI * 2), 0), 2) * bangDepth * playEnv;

  // lead leans back during sustained vibrato notes
  let lean = 0;
  if (isLead && tr._active && tr._active.d > 0.3) {
    lean = -Math.min((tNow - tr._active.t) / 0.5, 1) * 0.22;
  }

  const bob = bang * 4 * s;
  const hipY = floorY - 52 * s + bob;
  const shX = cx + Math.sin(lean) * 30 * s;
  const shY = hipY - 30 * s + bang * 2 * s;

  drawLegs(cx, hipY, floorY, s, isBass ? 13 : 10, bob);
  // torso
  bodyStroke([[cx, hipY], [shX, shY]], 7 * s);

  // head + hair
  const headAng = lean + bang * 0.9;
  const headX = shX + Math.sin(headAng) * 13 * s;
  const headY = shY - Math.cos(headAng) * 13 * s;
  drawHead(headX, headY, 7.5 * s, headAng, tr.color, {
    back: 1, len: (isBass ? 26 : 20) * s, swing: bang,
  });

  // --- instrument: neck up-left, body at the right hip ---
  const bodyPt = [shX + 12 * s, hipY - 4 * s];
  const neckLen = (isBass ? 58 : 48) * s;
  const neckAng = -2.6 + lean * 0.5; // pointing up-left
  const tipPt = [bodyPt[0] + Math.cos(neckAng) * neckLen, bodyPt[1] + Math.sin(neckAng) * neckLen];

  // strap
  strokeLine([[shX - 4 * s, shY], [bodyPt[0], bodyPt[1]]], 2 * s, 'rgba(120,130,170,0.35)');

  // guitar body silhouette
  g2d.fillStyle = '#0d0f1c';
  g2d.strokeStyle = tr.color;
  g2d.lineWidth = 1.6;
  g2d.shadowBlur = 6 + strum * 14;
  g2d.shadowColor = tr.color;
  g2d.beginPath();
  if (isBass) { // offset double-cut bass body
    g2d.ellipse(bodyPt[0] + 3 * s, bodyPt[1] + 2 * s, 10 * s, 8 * s, neckAng, 0, Math.PI * 2);
    g2d.ellipse(bodyPt[0] - 4 * s, bodyPt[1] - 2 * s, 7 * s, 6 * s, neckAng, 0, Math.PI * 2);
    g2d.fillStyle = '#232743';
  } else { // flying V
    const a = neckAng + Math.PI; // away from the neck
    const vx = Math.cos(a), vy = Math.sin(a);
    const px = -vy, py = vx;
    g2d.moveTo(bodyPt[0] - vx * 6 * s, bodyPt[1] - vy * 6 * s);
    g2d.lineTo(bodyPt[0] + vx * 20 * s + px * 12 * s, bodyPt[1] + vy * 20 * s + py * 12 * s);
    g2d.lineTo(bodyPt[0] + vx * 8 * s, bodyPt[1] + vy * 8 * s);
    g2d.lineTo(bodyPt[0] + vx * 20 * s - px * 12 * s, bodyPt[1] + vy * 20 * s - py * 12 * s);
    g2d.closePath();
  }
  g2d.fill(); g2d.stroke();
  g2d.shadowBlur = 0;

  // neck + a faint string in the instrument's color
  strokeLine([bodyPt, tipPt], 3.2 * s, '#3a3f5c');
  strokeLine([bodyPt, tipPt], 0.8 * s, tr.glow + '0.5)');

  // fret hand: position along the neck follows the pitch being played
  let fr = 0.5;
  if (tr._lastNote) fr = (tr._lastNote.m - tr.lo) / (tr.hi - tr.lo);
  const fpos = 0.92 - fr * 0.55; // higher note -> closer to the body
  const fx = bodyPt[0] + (tipPt[0] - bodyPt[0]) * fpos;
  const fy = bodyPt[1] + (tipPt[1] - bodyPt[1]) * fpos;
  bodyStroke([[shX - 6 * s, shY + 2 * s], [fx, fy]], 4 * s);
  g2d.fillStyle = tr.color;
  g2d.beginPath(); g2d.arc(fx, fy, 2.6 * s, 0, Math.PI * 2); g2d.fill();

  // strum hand: swings down through the strings on every hit
  const sx = bodyPt[0] + 2 * s;
  const sy = bodyPt[1] - 10 * s + strum * 16 * s;
  bodyStroke([[shX + 5 * s, shY + 3 * s], [sx + 4 * s, sy - (6 * s) * (1 - strum)], [sx, sy]], 4 * s);
  g2d.fillStyle = tr.color;
  g2d.beginPath(); g2d.arc(sx, sy, 2.6 * s, 0, Math.PI * 2); g2d.fill();
}

/* --- drummer with a drawn kit; sticks hit the right piece on time --- */
function kitLayout(colX, colW, stageTop, floorY) {
  const pad = 14;
  const px = f => colX + pad + f * (colW - pad * 2);
  const sh = floorY - stageTop;
  return {
    H: { x: px(KIT_FRAC.H), y: stageTop + sh * 0.38 },
    S: { x: px(KIT_FRAC.S), y: stageTop + sh * 0.60 },
    K: { x: px(KIT_FRAC.K), y: floorY - 26 },
    T: { x: px(KIT_FRAC.T), y: stageTop + sh * 0.46 },
    C: { x: px(KIT_FRAC.C), y: stageTop + sh * 0.22 },
  };
}

function drawCymbal(x, y, rx, glowE, color, tilt) {
  strokeLine([[x, floorYG], [x, y + 3]], 2.5, '#262a40'); // stand
  g2d.fillStyle = '#1d2033';
  g2d.strokeStyle = color;
  g2d.lineWidth = 1.6;
  g2d.shadowBlur = glowE * 22;
  g2d.shadowColor = color;
  g2d.beginPath();
  g2d.ellipse(x, y, rx, rx * 0.22, tilt + glowE * 0.12, 0, Math.PI * 2);
  g2d.fill(); g2d.stroke();
  g2d.shadowBlur = 0;
}

let floorYG = 0; // shared with drawCymbal for stands

function drawDrummer(tr, colX, colW, stageTop, floorY, tNow) {
  const kit = kitLayout(colX, colW, stageTop, floorY);
  bodyGlow = tr.color;
  const s = (floorY - stageTop) / 132;
  floorYG = floorY;
  const color = tr.color;

  const eK = env(tNow, tr._laneHit.K, 14);
  const eS = env(tNow, tr._laneHit.S, 12);
  const eH = env(tNow, tr._laneHit.H, 14);
  const eT = env(tNow, tr._laneHit.T, 12);
  const eC = env(tNow, tr._laneHit.C, 3.5);

  /* --- kit rear pieces first, then the drummer, then the kick in front --- */
  // hi-hat: two discs on a stand
  drawCymbal(kit.H.x, kit.H.y, 11 * s, eH, color, -0.05);
  drawCymbal(kit.H.x, kit.H.y + 4 + (1 - eH) * 2, 11 * s, eH * 0.5, color, 0.05);

  // crash: bigger, tilted
  drawCymbal(kit.C.x, kit.C.y, 16 * s, eC, color, -0.18);

  // snare + tom: cylinders
  function drum(x, y, rx, ry, e) {
    strokeLine([[x - rx * 0.7, floorY], [x - rx * 0.4, y + ry]], 2, '#262a40');
    strokeLine([[x + rx * 0.7, floorY], [x + rx * 0.4, y + ry]], 2, '#262a40');
    g2d.fillStyle = '#161929';
    g2d.strokeStyle = color;
    g2d.lineWidth = 1.6;
    g2d.shadowBlur = e * 20;
    g2d.shadowColor = color;
    roundRect(x - rx, y - ry, rx * 2, ry * 2, 3);
    g2d.fill(); g2d.stroke();
    g2d.beginPath();
    g2d.ellipse(x, y - ry, rx, rx * 0.25, 0, 0, Math.PI * 2);
    g2d.fillStyle = e > 0.4 ? color : '#222639';
    g2d.fill(); g2d.stroke();
    g2d.shadowBlur = 0;
  }
  drum(kit.S.x, kit.S.y, 12 * s, 7 * s, eS);
  drum(kit.T.x, kit.T.y, 10 * s, 8 * s, eT);

  /* drummer sits behind the kick, head and sticks above the kit */
  const cx = kit.K.x;
  const beat = (tNow / (STEP * 4)) % 1;
  const playEnv = env(tNow, tr._lastHit, 2.5);
  const bob = (Math.pow(Math.max(Math.cos(beat * Math.PI * 2), 0), 2) * 0.5 * playEnv + eK * 0.25) * 5 * s;
  const hipY = floorY - 48 * s;
  const shY = hipY - 38 * s + bob;

  bodyStroke([[cx, hipY], [cx, shY]], 7 * s);
  drawHead(cx, shY - 11 * s + bob * 0.5, 7 * s, bob * 0.12, color, { back: 0.6, len: 18 * s, swing: bob * 0.15 });

  // arms: left covers hat + snare, right covers tom + crash; rest above snare/tom
  const shL = [cx - 9 * s, shY + 4 * s];
  const shR = [cx + 9 * s, shY + 4 * s];
  const restL = [kit.S.x + 8 * s, kit.S.y - 16 * s];
  const restR = [kit.T.x - 8 * s, kit.T.y - 16 * s];

  function arm(sh, rest, targets) {
    // swing the stick toward the most recently hit piece
    let best = null, bestE = 0;
    for (const [piece, e] of targets) {
      if (e > bestE) { bestE = e; best = piece; }
    }
    let tip = rest;
    if (best && bestE > 0.05) {
      const k = kit[best];
      const target = [k.x, k.y - 6];
      const f = Math.min(bestE * 1.6, 1);
      tip = [rest[0] + (target[0] - rest[0]) * f, rest[1] + (target[1] - rest[1]) * f];
    }
    const elbow = [(sh[0] + tip[0]) / 2, (sh[1] + tip[1]) / 2 - 5 * s];
    bodyStroke([sh, elbow, tip], 4 * s);
    strokeLine([tip, [tip[0] + (tip[0] - elbow[0]) * 0.7, tip[1] + (tip[1] - elbow[1]) * 0.7]], 2 * s, '#c9cee0');
  }
  arm(shL, restL, [['H', eH], ['S', eS]]);
  arm(shR, restR, [['T', eT], ['C', eC * 3]]);

  // kick drum: big circle, front and center, flashes on the double kick
  g2d.fillStyle = '#10121f';
  g2d.strokeStyle = color;
  g2d.lineWidth = 2;
  g2d.shadowBlur = eK * 26;
  g2d.shadowColor = color;
  g2d.beginPath();
  g2d.arc(kit.K.x, kit.K.y, 20 * s, 0, Math.PI * 2);
  g2d.fill(); g2d.stroke();
  g2d.beginPath();
  g2d.arc(kit.K.x, kit.K.y, 20 * s * (0.55 + eK * 0.12), 0, Math.PI * 2);
  g2d.strokeStyle = tr.glow + (0.35 + eK * 0.6) + ')';
  g2d.stroke();
  g2d.shadowBlur = 0;
}

/* ---------------- Main frame ---------------- */

let lastFrame = 0;

function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min((ts - lastFrame) / 1000, 0.05);
  lastFrame = ts;

  const tNow = Math.max(0, Math.min(songTime(), SONG_DUR + 2));
  const hitY = H * 0.7;
  const floorY = H - 16;
  const pps = hitY / FALL; // pixels per second of fall

  for (const tr of TRACKS) updatePerf(tr, tNow);

  // background
  const bg = g2d.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#05060a');
  bg.addColorStop(1, '#0c0e1a');
  g2d.fillStyle = bg;
  g2d.fillRect(0, 0, W, H);

  // moving beat / bar grid lines
  const beatDur = STEP * 4;
  const firstBeat = Math.ceil(tNow / beatDur);
  for (let b = firstBeat; b * beatDur < tNow + FALL; b++) {
    const y = hitY - (b * beatDur - tNow) * pps;
    const isBar = b % 4 === 0;
    g2d.strokeStyle = isBar ? 'rgba(120,130,170,0.16)' : 'rgba(120,130,170,0.06)';
    g2d.lineWidth = 1;
    g2d.beginPath(); g2d.moveTo(0, y); g2d.lineTo(W, y); g2d.stroke();
  }

  // columns of falling notes
  let colX = 0;
  for (const tr of TRACKS) {
    const colW = W * tr.w;
    tr._x = colX; tr._w = colW;

    g2d.strokeStyle = 'rgba(120,130,170,0.12)';
    g2d.lineWidth = 1;
    g2d.beginPath(); g2d.moveTo(colX, 0); g2d.lineTo(colX, H); g2d.stroke();

    for (const n of tr.notes) {
      const headT = n.t, tailT = n.t + Math.max(n.d, 0.12);
      if (tailT < tNow || headT > tNow + FALL) continue;

      const { x, w } = noteX(tr, n, colX, colW);
      const headY = hitY - (headT - tNow) * pps;
      const tailY = hitY - (tailT - tNow) * pps;
      const top = Math.max(tailY, 0);
      const bottom = Math.min(headY, hitY);
      if (bottom <= top) continue;

      const nearHit = headT - tNow < 0.12 && headT - tNow > -0.05;
      g2d.shadowColor = tr.color;
      g2d.shadowBlur = nearHit ? 22 : 10;
      g2d.fillStyle = tr.color;
      g2d.globalAlpha = n.pm ? 0.8 : 1;
      roundRect(x, top, w, Math.max(bottom - top, 4), 4);
      g2d.fill();
      g2d.globalAlpha = 1;
      g2d.shadowBlur = 0;

      g2d.fillStyle = 'rgba(255,255,255,0.28)';
      roundRect(x + w * 0.25, top + 2, w * 0.18, Math.max(bottom - top - 4, 2), 2);
      g2d.fill();

      if (!n.hit && tNow >= headT && playing) {
        n.hit = true;
        spawnSparks(x + w / 2, hitY, tr.color, n.acc);
      }
    }

    colX += colW;
  }

  // hit line
  const hl = g2d.createLinearGradient(0, hitY - 3, 0, hitY + 3);
  hl.addColorStop(0, 'rgba(255,255,255,0)');
  hl.addColorStop(0.5, 'rgba(255,255,255,0.7)');
  hl.addColorStop(1, 'rgba(255,255,255,0)');
  g2d.fillStyle = hl;
  g2d.fillRect(0, hitY - 3, W, 6);

  /* ---- the stage ---- */
  g2d.fillStyle = 'rgba(11,13,23,0.92)';
  g2d.fillRect(0, hitY, W, H - hitY);
  g2d.strokeStyle = 'rgba(120,130,170,0.25)';
  g2d.lineWidth = 1;
  g2d.beginPath(); g2d.moveTo(0, floorY); g2d.lineTo(W, floorY); g2d.stroke();

  for (const tr of TRACKS) {
    const colX = tr._x, colW = tr._w;
    const cx = colX + colW / 2;

    // spotlight pulsing with hits
    const hitE = env(tNow, tr._lastHit, 6);
    const spot = g2d.createRadialGradient(cx, hitY, 6, cx, hitY, (H - hitY) * 1.15);
    spot.addColorStop(0, tr.glow + (0.24 + hitE * 0.25) + ')');
    spot.addColorStop(1, tr.glow + '0)');
    g2d.fillStyle = spot;
    g2d.fillRect(colX, hitY, colW, H - hitY);

    if (tr.drums) drawDrummer(tr, colX, colW, hitY + 8, floorY, tNow);
    else if (tr.name === 'BASS') drawStringPlayer(tr, colX, colW, hitY + 8, floorY, tNow, 'bass');
    else if (tr.name === 'LEAD GUITAR') drawStringPlayer(tr, colX, colW, hitY + 8, floorY, tNow, 'lead');
    else drawStringPlayer(tr, colX, colW, hitY + 8, floorY, tNow, 'rhythm');

    g2d.fillStyle = tr.color;
    g2d.font = '700 10px "Segoe UI", sans-serif';
    g2d.textAlign = 'center';
    g2d.fillText(tr.name, cx, H - 4);
  }

  // particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (playing) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 700 * dt;
      p.life -= dt * 2.2;
    }
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    g2d.globalAlpha = p.life;
    g2d.fillStyle = p.color;
    g2d.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
  }
  g2d.globalAlpha = 1;

  // progress bar
  const prog = Math.max(0, Math.min(tNow / SONG_DUR, 1));
  g2d.fillStyle = 'rgba(120,130,170,0.18)';
  g2d.fillRect(0, 0, W, 3);
  g2d.fillStyle = '#f59e0b';
  g2d.fillRect(0, 0, W * prog, 3);

  // clock
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  document.getElementById('time').textContent = `${fmt(Math.max(0, tNow))} / ${fmt(SONG_DUR)}`;
}

/* ---------------- UI wiring ---------------- */

document.getElementById('start').addEventListener('click', begin);
document.getElementById('btnPlay').addEventListener('click', () => { if (started) setPlaying(!playing); });
document.getElementById('btnRestart').addEventListener('click', () => { if (started) restart(); });
document.getElementById('vol').addEventListener('input', e => { if (master) master.gain.value = parseFloat(e.target.value); });
document.getElementById('btnSound').addEventListener('click', e => {
  soundMode = soundMode === 'chip' ? 'metal' : 'chip';
  e.target.textContent = soundMode === 'chip' ? '8-BIT' : 'METAL';
});
document.querySelectorAll('#tracks .trk').forEach(b => {
  b.addEventListener('click', () => selectSong(Number(b.dataset.i)));
});
window.addEventListener('keydown', e => {
  if (e.code === 'Space' && started) { e.preventDefault(); setPlaying(!playing); }
  if (e.key >= '1' && e.key <= String(SONGS.length)) selectSong(Number(e.key) - 1);
});

loadSong(0); // populate the default track + HUD
