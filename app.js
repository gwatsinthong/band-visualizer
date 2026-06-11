'use strict';

/* ============================================================
 * SEGFAULT — "Kernel Panic"
 * A falling-notes visualizer for a full synthesized metal band:
 * rhythm guitar / lead guitar / bass / drums. No vocals.
 * Everything (music + sound + visuals) is generated in-browser.
 * ============================================================ */

/* ---------------- Song data ---------------- */

const BPM = 160;
const STEP = 60 / BPM / 4; // one 16th note, in seconds
const BAR = 16;            // 16th-note steps per bar

// pitches (MIDI)
const E1 = 28, E2 = 40, G2 = 43, A2 = 45, Bb2 = 46, B2 = 47, C3 = 48, D3 = 50;

const R = [];  // rhythm guitar {s, m, d, pm, ch, v}
const L = [];  // lead guitar   {s, m, d}
const BS = []; // bass          {s, m, d}
const DRm = []; // drums        {s, p}

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

const SONG_STEPS = 37 * BAR;
const SONG_DUR = SONG_STEPS * STEP;  // ~55.5 s
const LOOP_AT = SONG_DUR + 1.2;      // let the last chord ring before looping

/* ---------------- Track / visual note model ---------------- */

const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

// expand power chords into individual visual notes
function expandRhythm() {
  const out = [];
  for (const n of R) {
    const tones = n.ch ? [n.m, n.m + 7, n.m + 12] : [n.m];
    for (const m of tones) out.push({ t: n.s * STEP, d: n.d * STEP, m, pm: n.pm });
  }
  return out;
}

const DRUM_LANES = ['K', 'S', 'H', 'T', 'C'];
const DRUM_LABEL = { K: 'KICK', S: 'SNARE', H: 'HAT', T: 'TOM', C: 'CRASH' };

const TRACKS = [
  { name: 'RHYTHM GUITAR', color: '#f59e0b', glow: 'rgba(245,158,11,', notes: expandRhythm(), w: 0.29 },
  { name: 'LEAD GUITAR', color: '#22d3ee', glow: 'rgba(34,211,238,', notes: L.map(n => ({ t: n.s * STEP, d: n.d * STEP, m: n.m })), w: 0.29 },
  { name: 'BASS', color: '#a78bfa', glow: 'rgba(167,139,250,', notes: BS.map(n => ({ t: n.s * STEP, d: n.d * STEP, m: n.m })), w: 0.2 },
  { name: 'DRUMS', color: '#f43f5e', glow: 'rgba(244,63,94,', notes: DRm.map(n => ({ t: n.s * STEP, d: 0.08, lane: DRUM_LANES.indexOf(n.p), p: n.p })), w: 0.22, drums: true },
];

for (const tr of TRACKS) {
  tr.notes.sort((a, b) => a.t - b.t);
  if (!tr.drums) {
    let lo = Infinity, hi = -Infinity;
    for (const n of tr.notes) { lo = Math.min(lo, n.m); hi = Math.max(hi, n.m); }
    tr.lo = lo - 1; tr.hi = hi + 1;
  }
}

/* ---------------- Audio engine ---------------- */

let ctx = null, master = null, busses = null, noiseBuf = null;

function distCurve(k) {
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(k * x);
  }
  return c;
}

// guitar/bass "amp": drive -> waveshaper -> tone stack -> level
function makeAmp({ drive, k, tone, hp, level }) {
  const pre = ctx.createGain(); pre.gain.value = drive;
  const ws = ctx.createWaveShaper(); ws.curve = distCurve(k); ws.oversample = '2x';
  const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = hp;
  const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = tone;
  const out = ctx.createGain(); out.gain.value = level;
  pre.connect(ws); ws.connect(hpf); hpf.connect(lpf); lpf.connect(out); out.connect(master);
  return { in: pre, out };
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

  busses = {
    rhythm: makeAmp({ drive: 3.2, k: 5, tone: 3400, hp: 70, level: 0.34 }),
    lead: makeAmp({ drive: 2.6, k: 4, tone: 4600, hp: 240, level: 0.4 }),
    bass: makeAmp({ drive: 1.8, k: 3, tone: 950, hp: 30, level: 0.55 }),
    drums: (() => { const g = ctx.createGain(); g.gain.value = 0.9; g.connect(master); return { in: g }; })(),
  };

  // a touch of slap-back delay on the lead so it sings
  const dly = ctx.createDelay(1); dly.delayTime.value = 0.32;
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const wet = ctx.createGain(); wet.gain.value = 0.18;
  busses.lead.out.connect(dly); dly.connect(fb); fb.connect(dly);
  dly.connect(wet); wet.connect(master);
}

function guitarNote(bus, t, midi, dur, { pm = false, vel = 1, vibrato = false } = {}) {
  const f = midiHz(midi);
  const env = ctx.createGain();
  const flt = ctx.createBiquadFilter();
  flt.type = 'lowpass';
  flt.frequency.value = pm ? 1300 : 6000;
  flt.connect(env); env.connect(bus.in);

  const oscs = [];
  for (const det of [-6, 6]) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.detune.value = det;
    o.connect(flt);
    oscs.push(o);
  }

  if (vibrato) {
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.5;
    const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(f * 0.012, t + 0.45);
    lfo.connect(lg);
    for (const o of oscs) lg.connect(o.frequency);
    lfo.start(t); lfo.stop(t + dur + 0.3);
  }

  const g = 0.22 * vel;
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(g, t + 0.005);
  if (pm) {
    env.gain.exponentialRampToValueAtTime(0.001, t + Math.max(0.1, Math.min(dur, 0.16)));
  } else {
    env.gain.setValueAtTime(g, t + Math.max(0.01, dur - 0.04));
    env.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.12);
  }
  const end = t + (pm ? 0.2 : dur + 0.2);
  for (const o of oscs) { o.start(t); o.stop(end); }
}

function noiseHit(t, { hpFreq, bpFreq, dur, gain }) {
  const src = ctx.createBufferSource(); src.buffer = noiseBuf;
  let node = src;
  if (hpFreq) {
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hpFreq;
    node.connect(hp); node = hp;
  }
  if (bpFreq) {
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = bpFreq; bp.Q.value = 0.9;
    node.connect(bp); node = bp;
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  node.connect(g); g.connect(busses.drums.in);
  src.start(t); src.stop(t + dur + 0.05);
}

function drumHit(p, t) {
  if (p === 'K') {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(46, t + 0.09);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1.0, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    o.connect(g); g.connect(busses.drums.in);
    o.start(t); o.stop(t + 0.3);
    noiseHit(t, { hpFreq: 1500, dur: 0.025, gain: 0.4 }); // beater click
  } else if (p === 'S') {
    noiseHit(t, { bpFreq: 1800, dur: 0.18, gain: 0.7 });
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 190;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(g); g.connect(busses.drums.in);
    o.start(t); o.stop(t + 0.1);
  } else if (p === 'H') {
    noiseHit(t, { hpFreq: 8500, dur: 0.05, gain: 0.22 });
  } else if (p === 'C') {
    noiseHit(t, { hpFreq: 5200, dur: 1.4, gain: 0.45 });
  } else if (p === 'T') {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(135, t);
    o.frequency.exponentialRampToValueAtTime(85, t + 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(busses.drums.in);
    o.start(t); o.stop(t + 0.35);
  }
}

/* --- flat, time-sorted list of everything to play --- */
function buildSchedule() {
  const ev = [];
  for (const n of R) {
    const tones = n.ch ? [[n.m, 1], [n.m + 7, 0.8], [n.m + 12, 0.65]] : [[n.m, 1]];
    for (const [m, gv] of tones) {
      ev.push({ t: n.s * STEP, fire: at => guitarNote(busses.rhythm, at, m, n.d * STEP, { pm: n.pm, vel: n.v * gv }) });
    }
  }
  for (const n of L) {
    ev.push({ t: n.s * STEP, fire: at => guitarNote(busses.lead, at, n.m, n.d * STEP, { vibrato: n.d >= 6 }) });
  }
  for (const n of BS) {
    ev.push({ t: n.s * STEP, fire: at => guitarNote(busses.bass, at, n.m, n.d * STEP, { pm: n.d <= 2 }) });
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
  schedule = buildSchedule();
  startCtxTime = ctx.currentTime + 0.6;
  playing = true;
  schedTimer = setInterval(schedulerTick, 25);
  requestAnimationFrame(frame);
}

/* ---------------- Visualizer ---------------- */

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
    const laneW = (colW - pad * 2) / DRUM_LANES.length;
    return { x: colX + pad + n.lane * laneW + laneW * 0.2, w: laneW * 0.6 };
  }
  const span = tr.hi - tr.lo;
  const laneW = (colW - pad * 2) / span;
  return { x: colX + pad + (n.m - tr.lo) * laneW, w: Math.max(6, laneW * 0.85) };
}

function spawnSparks(x, y, color) {
  for (let i = 0; i < 7; i++) {
    if (particles.length > 350) particles.shift();
    particles.push({
      x, y, color,
      vx: (Math.random() - 0.5) * 220,
      vy: -Math.random() * 260 - 40,
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

let lastFrame = 0;

function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min((ts - lastFrame) / 1000, 0.05);
  lastFrame = ts;

  const tNow = Math.max(0, Math.min(songTime(), SONG_DUR + 2));
  const hitY = H * 0.78;
  const pps = hitY / FALL; // pixels per second of fall

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

  // columns
  let colX = 0;
  for (const tr of TRACKS) {
    const colW = W * tr.w;
    tr._x = colX; tr._w = colW;

    // column separator
    g2d.strokeStyle = 'rgba(120,130,170,0.12)';
    g2d.lineWidth = 1;
    g2d.beginPath(); g2d.moveTo(colX, 0); g2d.lineTo(colX, H); g2d.stroke();

    // notes
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

      // inner highlight stripe
      g2d.fillStyle = 'rgba(255,255,255,0.28)';
      roundRect(x + w * 0.25, top + 2, w * 0.18, Math.max(bottom - top - 4, 2), 2);
      g2d.fill();

      if (!n.hit && tNow >= headT && playing) {
        n.hit = true;
        spawnSparks(x + w / 2, hitY, tr.color);
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

  // instrument decks
  for (const tr of TRACKS) {
    const colX = tr._x, colW = tr._w;
    const deckTop = hitY;

    g2d.fillStyle = 'rgba(13,15,26,0.9)';
    g2d.fillRect(colX, deckTop, colW, H - deckTop);

    if (tr.drums) {
      const pad = 14;
      const laneW = (colW - pad * 2) / DRUM_LANES.length;
      for (let i = 0; i < DRUM_LANES.length; i++) {
        const cx = colX + pad + i * laneW + laneW / 2;
        const cy = deckTop + (H - deckTop) * 0.42;
        const rad = Math.min(laneW * 0.32, 26);
        const active = tr.notes.some(n => n.lane === i && tNow >= n.t && tNow < n.t + 0.15);
        g2d.beginPath();
        g2d.arc(cx, cy, rad, 0, Math.PI * 2);
        g2d.fillStyle = active ? tr.color : '#1a1d2e';
        g2d.shadowColor = tr.color;
        g2d.shadowBlur = active ? 26 : 0;
        g2d.fill();
        g2d.shadowBlur = 0;
        g2d.strokeStyle = tr.glow + '0.5)';
        g2d.lineWidth = 1.5;
        g2d.stroke();
        g2d.fillStyle = active ? '#0c0e1a' : '#8b90a3';
        g2d.font = '600 9px "Segoe UI", sans-serif';
        g2d.textAlign = 'center';
        g2d.fillText(DRUM_LABEL[DRUM_LANES[i]], cx, cy + rad + 14);
      }
    } else {
      // "strings" + glowing pads where notes land
      const strings = tr.name === 'BASS' ? 4 : 6;
      for (let i = 0; i < strings; i++) {
        const sy = deckTop + 18 + i * ((H - deckTop - 40) / Math.max(strings - 1, 1));
        g2d.strokeStyle = 'rgba(150,155,180,0.22)';
        g2d.lineWidth = 0.5 + i * 0.25;
        g2d.beginPath(); g2d.moveTo(colX + 14, sy); g2d.lineTo(colX + colW - 14, sy); g2d.stroke();
      }
      for (const n of tr.notes) {
        if (!(tNow >= n.t && tNow < n.t + Math.max(n.d, 0.15))) continue;
        const { x, w } = noteX(tr, n, colX, colW);
        const grad = g2d.createRadialGradient(x + w / 2, deckTop + 8, 2, x + w / 2, deckTop + 8, 36);
        grad.addColorStop(0, tr.glow + '0.85)');
        grad.addColorStop(1, tr.glow + '0)');
        g2d.fillStyle = grad;
        g2d.fillRect(x + w / 2 - 36, deckTop, 72, 72);
      }
    }

    // label
    g2d.fillStyle = tr.color;
    g2d.font = '700 11px "Segoe UI", sans-serif';
    g2d.textAlign = 'center';
    g2d.fillText(tr.name, colX + colW / 2, H - 12);
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
window.addEventListener('keydown', e => {
  if (e.code === 'Space' && started) { e.preventDefault(); setPlaying(!playing); }
});
