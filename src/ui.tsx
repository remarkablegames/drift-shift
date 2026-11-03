import { useClassList, useRef, useText } from 'jsx-dom';

let hudControls: {
  setDistance: (value: string) => void;
  setSpeed: (value: string) => void;
  setDrift: (value: string) => void;
} | null = null;

let gameOverControls: {
  setFinalDistance: (value: string) => void;
} | null = null;

function StartScreen({ onStart }: { onStart?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      id="start-screen"
      ref={ref}
      class="pointer-events-auto z-50 flex flex-col items-center justify-center text-center"
    >
      <div class="rounded-lg border-2 border-pink-500 bg-black/40 p-8 shadow-[0_0_40px_rgba(255,0,85,0.6)] backdrop-blur-sm">
        <h1 class="mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-6xl font-bold tracking-tighter text-transparent">
          DRIFT SHIFT
        </h1>
        <p class="mb-6 text-lg text-cyan-300">
          Low-poly synthwave endless racer
        </p>
        <div class="mb-6 space-y-1 text-xs text-pink-400">
          <div>Arrow keys — steer &amp; accelerate</div>
          <div>Hold Shift — drift</div>
        </div>
        <button
          class="rounded bg-pink-500 px-8 py-3 font-bold tracking-widest text-white transition hover:bg-pink-400"
          onClick={onStart}
        >
          Press SPACE to start
        </button>
      </div>
    </div>
  );
}

function Hud() {
  const ref = useRef<HTMLDivElement>(null);
  const classList = useClassList([
    'pointer-events-none flex w-full items-start justify-between',
    { hidden: true },
  ]);
  const [distance, setDistance] = useText('0 m');
  const [speed, setSpeed] = useText('0 km/h');
  const [drift, setDrift] = useText('OFF');
  hudControls = { setDistance, setSpeed, setDrift };
  return (
    <div id="hud" ref={ref} class={classList}>
      <div class="pointer-events-auto">
        <div class="font-mono text-xs tracking-widest text-cyan-400 uppercase">
          distance
        </div>
        <div id="hud-distance" class="font-mono text-3xl font-bold text-white">
          {distance}
        </div>
      </div>
      <div class="pointer-events-auto">
        <div class="font-mono text-xs tracking-widest text-pink-400 uppercase">
          speed
        </div>
        <div id="hud-speed" class="font-mono text-3xl font-bold text-white">
          {speed}
        </div>
      </div>
      <div class="pointer-events-auto">
        <div class="font-mono text-xs tracking-widest text-purple-400 uppercase">
          drift
        </div>
        <div id="hud-drift" class="font-mono text-3xl font-bold text-white">
          {drift}
        </div>
      </div>
    </div>
  );
}

function GameOverScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const classList = useClassList([
    'pointer-events-auto z-50 flex flex-col items-center justify-center text-center',
    { hidden: true },
  ]);
  const [finalDistance, setFinalDistance] = useText('0');
  gameOverControls = { setFinalDistance };

  return (
    <div id="game-over" ref={ref} class={classList}>
      <div class="rounded-lg border-2 border-pink-500 bg-black/90 p-8 shadow-[0_0_40px_rgba(255,0,85,0.6)] backdrop-blur-md">
        <h2 class="mb-2 text-4xl font-bold text-pink-400">GAME OVER</h2>
        <div class="mb-4 text-lg text-cyan-300">
          Distance:{' '}
          <span id="game-over-distance" class="text-white">
            {finalDistance}
          </span>{' '}
          m
        </div>
        <button class="rounded bg-pink-500 px-8 py-3 font-bold tracking-widest text-white transition hover:bg-pink-400">
          Press SPACE to restart
        </button>
      </div>
    </div>
  );
}

const ui = document.getElementById('ui') as HTMLDivElement;

const startScreenElement = <StartScreen />;
const hudElement = <Hud />;
const gameOverScreenElement = <GameOverScreen />;

[startScreenElement, hudElement, gameOverScreenElement].forEach((element) => {
  ui.appendChild(element);
});

export const UI = {
  setState: (state: 'start' | 'playing' | 'gameOver') => {
    startScreenElement.classList.toggle('hidden', state !== 'start');
    hudElement.classList.toggle('hidden', state !== 'playing');
    gameOverScreenElement.classList.toggle('hidden', state !== 'gameOver');
  },

  setDistance: (meters: number) => {
    hudControls?.setDistance(Math.floor(meters).toString() + ' m');
  },

  setSpeed: (kmh: number) => {
    hudControls?.setSpeed(Math.floor(kmh).toString() + ' km/h');
  },

  setDrift: (active: boolean) => {
    hudControls?.setDrift(active ? 'ON' : 'OFF');
  },

  setFinalDistance: (meters: number) => {
    gameOverControls?.setFinalDistance(Math.floor(meters).toString());
  },

  onStart: (handler: () => void) => {
    const button = startScreenElement.querySelector('button');
    if (button) {
      button.addEventListener('click', handler);
    }
  },
};
