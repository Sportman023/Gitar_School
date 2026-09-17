// Sound is synthesised right in the browser (Web Audio), no audio files.
// The only exception is the piano, which is made of recordings (piano.js).
// A plucked string uses the Karplus–Strong algorithm: a short burst of noise
// that loops on itself and slowly decays. It sounds close to a guitar.

let ctx = null;

export function ensureAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function playNote(freq, { duration = 1.8, volume = 0.7 } = {}) {
  const ac = ensureAudio();
  if (!ac) return;

  const sampleRate = ac.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const period = Math.max(2, Math.round(sampleRate / freq));

  const buffer = ac.createBuffer(1, length, sampleRate);
  const out = buffer.getChannelData(0);

  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  // smooth the initial noise so the pluck sounds softer
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < period; i++) ring[i] = (ring[i] + ring[(i + 1) % period]) / 2;
  }

  let idx = 0;
  const damping = 0.996;
  for (let i = 0; i < length; i++) {
    const current = ring[idx];
    out[i] = current;
    ring[idx] = (current + ring[(idx + 1) % period]) * 0.5 * damping;
    idx = (idx + 1) % period;
  }

  const fade = Math.floor(sampleRate * 0.25);
  for (let i = Math.max(0, length - fade); i < length; i++) out[i] *= (length - i) / fade;

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 3800;

  const gain = ac.createGain();
  gain.gain.value = volume;

  source.connect(filter).connect(gain).connect(ac.destination);
  source.start();
  return source;
}

export function playScale(notes, { step = 380 } = {}) {
  notes.forEach((note, i) => setTimeout(() => playNote(note.freq, { duration: 1.2 }), i * step));
}

function blip(freq, startOffset, duration, type = 'sine', volume = 0.25) {
  const ac = ensureAudio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const start = ac.currentTime + startOffset;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playSuccess() {
  [523.25, 659.25, 783.99].forEach((f, i) => blip(f, i * 0.09, 0.22, 'triangle', 0.22));
}

export function playFail() {
  blip(196, 0, 0.25, 'sawtooth', 0.12);
  blip(155, 0.1, 0.3, 'sawtooth', 0.12);
}

export function playFanfare() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, i * 0.12, 0.35, 'triangle', 0.2));
}
