import * as THREE from 'three';

import { Input } from './input';

const MAX_SPEED = 22;
const ACCELERATION = 14;
const BRAKE = 18;
const FRICTION = 6;
const STEER_SPEED = 4.0;
const DRIFT_STEER_MULT = 2.2;
const LATERAL_FRICTION = 4;
const DRIFT_LATERAL_FRICTION = 1.2;
const TURN_RADIUS_BASE = 0.0026;

const CAR_WIDTH = 1.2;
const CAR_LENGTH = 2.4;
const CAR_HEIGHT = 0.8;

const createCarMesh = () => {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(CAR_LENGTH, CAR_HEIGHT * 0.7, CAR_WIDTH),
    new THREE.MeshPhongMaterial({ color: 0xff0055 }),
  );
  body.position.y = CAR_HEIGHT * 0.35;
  group.add(body);

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(CAR_LENGTH * 0.6, CAR_HEIGHT * 0.5, CAR_WIDTH * 0.7),
    new THREE.MeshPhongMaterial({ color: 0x222222 }),
  );
  cabin.position.set(0, CAR_HEIGHT * 0.75, 0);
  group.add(cabin);

  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, CAR_WIDTH * 0.9, 6);
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
  const wheelPositions = [
    [-CAR_LENGTH * 0.35, CAR_HEIGHT * 0.45, -CAR_WIDTH * 0.55],
    [CAR_LENGTH * 0.35, CAR_HEIGHT * 0.45, -CAR_WIDTH * 0.55],
    [-CAR_LENGTH * 0.35, CAR_HEIGHT * 0.45, CAR_WIDTH * 0.55],
    [CAR_LENGTH * 0.35, CAR_HEIGHT * 0.45, CAR_WIDTH * 0.55],
  ];
  for (const [x, y, z] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    group.add(wheel);
  }

  const neon = new THREE.Mesh(
    new THREE.BoxGeometry(CAR_LENGTH * 0.9, 0.12, CAR_WIDTH * 0.85),
    new THREE.MeshBasicMaterial({ color: 0x00ffff }),
  );
  neon.position.set(0, CAR_HEIGHT * 0.02, 0);
  group.add(neon);

  return group;
};

export class Car {
  readonly mesh: THREE.Group;
  readonly position = new THREE.Vector3();
  readonly velocity = new THREE.Vector3();
  private yaw = 0;
  private speed = 0;
  private lateralSpeed = 0;
  private steering = 0;
  private driftAngle = 0;
  private isDrifting = false;

  constructor() {
    this.mesh = createCarMesh();
    this.mesh.position.copy(this.position);
  }

  getSpeed(): number {
    return this.speed;
  }

  getYaw(): number {
    return this.yaw;
  }

  getIsDrifting(): boolean {
    return this.isDrifting;
  }

  update(dt: number, input: ReturnType<Input['get']>) {
    const accel = input.up ? ACCELERATION : input.down ? -BRAKE : 0;
    const steerInput = input.left ? 1 : input.right ? -1 : 0;
    this.isDrifting =
      input.shift && Math.abs(steerInput) > 0 && Math.abs(this.speed) > 2;

    this.speed += accel * dt;
    if (this.speed > MAX_SPEED) this.speed = MAX_SPEED;
    if (this.speed < -MAX_SPEED * 0.4) this.speed = -MAX_SPEED * 0.4;

    const friction = this.speed > 0 ? FRICTION : FRICTION * 0.5;
    this.speed -= Math.sign(this.speed) * friction * dt;
    if (Math.abs(this.speed) < 0.05 && accel === 0) this.speed = 0;

    const lateralFriction = this.isDrifting
      ? DRIFT_LATERAL_FRICTION
      : LATERAL_FRICTION;
    this.lateralSpeed -= Math.sign(this.lateralSpeed) * lateralFriction * dt;
    if (Math.abs(this.lateralSpeed) < 0.02) this.lateralSpeed = 0;

    this.steering = steerInput;
    const turnRate =
      this.steering * STEER_SPEED * Math.abs(this.speed) * TURN_RADIUS_BASE;
    if (this.isDrifting) {
      this.driftAngle += turnRate * DRIFT_STEER_MULT * dt;
      this.yaw += turnRate * dt * 0.5;
    } else {
      this.yaw += turnRate * dt;
      this.driftAngle = THREE.MathUtils.lerp(this.driftAngle, 0, dt * 5);
    }

    const forward = new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw),
    );
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    const driftEff = this.isDrifting ? 0.3 : 0;
    const moveForward = forward.multiplyScalar(
      this.speed * (1 - driftEff) * dt,
    );
    const moveLateral = right.multiplyScalar(this.lateralSpeed * dt);
    const moveDrift = right.multiplyScalar(this.speed * this.driftAngle * dt);

    this.position.add(moveForward);
    this.position.add(moveLateral);
    this.position.add(moveDrift);

    this.position.y = 0;

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.yaw + this.driftAngle;
    this.mesh.rotation.z = this.steering * 0.15 * (this.speed > 0 ? 1 : -1);
    this.mesh.rotation.x = this.isDrifting
      ? Math.sin(Date.now() * 0.02) * 0.05
      : 0;
  }

  reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.yaw = 0;
    this.speed = 0;
    this.lateralSpeed = 0;
    this.steering = 0;
    this.driftAngle = 0;
    this.isDrifting = false;
    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, 0, 0);
  }
}
