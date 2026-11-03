const webkit = (
  window as unknown as { webkitAudioContext?: typeof AudioContext }
).webkitAudioContext;
const AudioCtor = webkit ?? window.AudioContext;
const CONTEXT = new AudioCtor();

const ensureStarted = () => {
  void CONTEXT.resume();
};

const gainNode = CONTEXT.createGain();
gainNode.gain.value = 0.3;
gainNode.connect(CONTEXT.destination);

const playTone = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  startTime: number = CONTEXT.currentTime,
  volume = 0.2,
) => {
  ensureStarted();
  const osc = CONTEXT.createOscillator();
  const env = CONTEXT.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  env.gain.setValueAtTime(volume, startTime);
  env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(env);
  env.connect(gainNode);
  osc.start(startTime);
  osc.stop(startTime + duration);
};

const playChord = (
  frequencies: number[],
  duration: number,
  type: OscillatorType = 'sawtooth',
  volume = 0.1,
) => {
  for (const freq of frequencies) {
    playTone(freq, duration, type, CONTEXT.currentTime, volume);
  }
};

const engineOsc = CONTEXT.createOscillator();
const engineGain = CONTEXT.createGain();
engineOsc.type = 'sawtooth';
engineOsc.frequency.setValueAtTime(110, CONTEXT.currentTime);
engineGain.gain.setValueAtTime(0, CONTEXT.currentTime);
engineOsc.connect(engineGain);
engineGain.connect(gainNode);
engineOsc.start(CONTEXT.currentTime);

let engineActive = false;
let lastDriftTime = 0;

const updateEngine = (speed: number, active: boolean) => {
  ensureStarted();
  if (!active) {
    if (engineActive) {
      engineGain.gain.exponentialRampToValueAtTime(
        0.001,
        CONTEXT.currentTime + 0.5,
      );
      engineActive = false;
    }
    return;
  }
  if (!engineActive) {
    engineGain.gain.setValueAtTime(0.01, CONTEXT.currentTime);
    engineGain.gain.exponentialRampToValueAtTime(
      0.15,
      CONTEXT.currentTime + 0.2,
    );
    engineActive = true;
  }
  const targetFreq = 110 + speed * 40;
  engineOsc.frequency.exponentialRampToValueAtTime(
    Math.max(targetFreq, 55),
    CONTEXT.currentTime + 0.1,
  );
};

const stopEngine = () => {
  engineActive = false;
  engineGain.gain.cancelScheduledValues(CONTEXT.currentTime);
  engineGain.gain.exponentialRampToValueAtTime(
    0.001,
    CONTEXT.currentTime + 0.3,
  );
};

const playDrift = () => {
  const now = CONTEXT.currentTime;
  if (now - lastDriftTime < 0.2) {
    return;
  }
  lastDriftTime = now;
  ensureStarted();
  const noise = CONTEXT.createBufferSource();
  const buffer = CONTEXT.createBuffer(
    1,
    CONTEXT.sampleRate * 0.3,
    CONTEXT.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;
  const bp = CONTEXT.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 400;
  const env = CONTEXT.createGain();
  env.gain.setValueAtTime(0.2, CONTEXT.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, CONTEXT.currentTime + 0.3);
  noise.connect(bp);
  bp.connect(env);
  env.connect(gainNode);
  noise.start(CONTEXT.currentTime);
  noise.stop(CONTEXT.currentTime + 0.3);
};

const playCrash = () => {
  ensureStarted();
  const noise = CONTEXT.createBufferSource();
  const buffer = CONTEXT.createBuffer(
    1,
    CONTEXT.sampleRate * 0.6,
    CONTEXT.sampleRate,
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buffer;
  const env = CONTEXT.createGain();
  env.gain.setValueAtTime(0.5, CONTEXT.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, CONTEXT.currentTime + 0.6);
  noise.connect(env);
  env.connect(gainNode);
  noise.start(CONTEXT.currentTime);
  noise.stop(CONTEXT.currentTime + 0.6);
};

const playStart = () => {
  ensureStarted();
  playTone(440, 0.15, 'square');
  playTone(554, 0.15, 'square', CONTEXT.currentTime + 0.08);
  playTone(659, 0.3, 'square', CONTEXT.currentTime + 0.16);
};

let musicInterval: number | null = null;

const startMusic = () => {
  ensureStarted();
  stopMusic();
  const bassNotes = [110, 130.81, 164.81, 196];
  let index = 0;
  playChord(
    [bassNotes[index], bassNotes[index] * 1.5, bassNotes[index] * 2],
    0.4,
    'sawtooth',
    0.12,
  );
  musicInterval = window.setInterval(() => {
    index = (index + 1) % bassNotes.length;
    playChord(
      [bassNotes[index], bassNotes[index] * 1.5, bassNotes[index] * 2],
      0.4,
      'sawtooth',
      0.12,
    );
  }, 400);
};

const stopMusic = () => {
  if (musicInterval !== null) {
    window.clearInterval(musicInterval);
    musicInterval = null;
  }
};

export const AudioManager = {
  playTone,
  playChord,
  updateEngine,
  stopEngine,
  playDrift,
  playCrash,
  playStart,
  startMusic,
  stopMusic,
};
