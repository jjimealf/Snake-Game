import { MUSIC_PATTERN } from './constants.js';

export function getAudioContext(audioContextRef) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioContextRef.current) {
    audioContextRef.current = new AudioCtx();
  }

  return audioContextRef.current;
}

export function resumeAudioContext(audioContextRef) {
  const ctx = getAudioContext(audioContextRef);
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function playTone({
  audioContextRef,
  musicEnabledRef,
  freq,
  duration = 0.1,
  type = 'square',
  volume = 0.02
}) {
  if (!musicEnabledRef.current || !freq) return;

  const ctx = resumeAudioContext(audioContextRef);
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playMusicTick({ audioContextRef, musicEnabledRef, musicStepRef }) {
  if (!musicEnabledRef.current) return;

  const note = MUSIC_PATTERN[musicStepRef.current % MUSIC_PATTERN.length];
  musicStepRef.current += 1;

  if (note.freq > 0) {
    playTone({
      audioContextRef,
      musicEnabledRef,
      freq: note.freq,
      duration: 0.14 * note.len,
      type: 'square',
      volume: 0.012
    });
  }
}
