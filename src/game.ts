import { AudioManager } from './audio';
import { Car } from './car';
import { EnvironmentManager } from './environment';
import { Input } from './input';
import { RoadManager } from './road';
import { UI } from './ui';

type GameState = 'start' | 'playing' | 'gameOver';

const BASE_SPEED = 10;
const SPEED_INCREMENT = 0.0004;
const MAX_DIFFICULTY = 2;
const COLLISION_RADIUS = 0.9;

export class GameStateManager {
  private state: GameState = 'start';
  private distance = 0;
  private difficulty = 0;
  private carZAtStart = 0;

  private lastTime: number | null = null;

  private readonly input: Input;
  private readonly car: Car;
  private readonly road: RoadManager;
  private readonly environment: EnvironmentManager;
  private readonly audio: typeof AudioManager;

  constructor(
    input: Input,
    car: Car,
    road: RoadManager,
    environment: EnvironmentManager,
    audio: typeof AudioManager,
  ) {
    this.input = input;
    this.car = car;
    this.road = road;
    this.environment = environment;
    this.audio = audio;
  }

  getState(): GameState {
    return this.state;
  }

  getDistance(): number {
    return this.distance;
  }

  start() {
    this.state = 'playing';
    this.distance = 0;
    this.difficulty = 0;
    this.carZAtStart = this.car.position.z;
    this.car.reset();
    this.road.reset();
    this.environment.reset();
    UI.setState('playing');
    this.audio.playStart();
    this.audio.startMusic();
  }

  gameOver() {
    if (this.state === 'gameOver') return;
    this.state = 'gameOver';
    this.audio.stopMusic();
    this.audio.playCrash();
    this.audio.stopEngine();
    UI.setState('gameOver');
    UI.setFinalDistance(this.distance);
  }

  restart() {
    this.start();
  }

  update(time: number) {
    if (this.state === 'start') {
      const inputState = this.input.get();
      if (inputState.space) {
        this.start();
      }
      return;
    }

    if (this.state === 'gameOver') {
      const inputState = this.input.get();
      if (inputState.space) {
        this.restart();
      }
      return;
    }

    const dt = this.lastTime === null ? 1 / 60 : (time - this.lastTime) / 1000;
    this.lastTime = time;

    const inputState = this.input.get();
    this.car.update(dt, inputState);

    this.audio.updateEngine(this.car.getSpeed(), inputState.up);
    if (this.car.getIsDrifting()) {
      this.audio.playDrift();
    }
    UI.setDrift(this.car.getIsDrifting());

    this.distance = Math.max(0, this.carZAtStart - this.car.position.z);
    this.difficulty = Math.min(MAX_DIFFICULTY, this.distance * SPEED_INCREMENT);

    const currentSpeed =
      BASE_SPEED +
      this.distance * SPEED_INCREMENT * 30 +
      this.car.getSpeed() * 0.3;
    UI.setDistance(this.distance);
    UI.setSpeed(currentSpeed);

    this.road.update(this.car.position.z, this.difficulty);

    for (const obstacle of this.road.getObstacles()) {
      if (
        obstacle.collidesWith(
          this.car.position.x,
          this.car.position.z,
          COLLISION_RADIUS,
        )
      ) {
        this.gameOver();
        return;
      }
    }
  }
}
