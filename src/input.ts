export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  shift: boolean;
  space: boolean;
}

const KEYS: Record<string, keyof InputState> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Shift: 'shift',
  ' ': 'space',
};

export class Input {
  private state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    shift: false,
    space: false,
  };

  constructor() {
    window.addEventListener('keydown', (event) => {
      if (!(event.key in KEYS)) {
        return;
      }
      const key = KEYS[event.key];
      event.preventDefault();
      this.state[key] = true;
    });

    window.addEventListener('keyup', (event) => {
      if (!(event.key in KEYS)) {
        return;
      }
      const key = KEYS[event.key];
      event.preventDefault();
      this.state[key] = false;
    });

    window.addEventListener('blur', () => {
      this.state = {
        left: false,
        right: false,
        up: false,
        down: false,
        shift: false,
        space: false,
      };
    });
  }

  get(): InputState {
    return this.state;
  }
}
