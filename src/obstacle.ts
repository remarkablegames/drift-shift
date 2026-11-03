import * as THREE from 'three';

const OBSTACLE_RADIUS = 1.6;
const OBSTACLE_HEIGHT = 2.4;

const createObstacleMesh = (color: number) => {
  const group = new THREE.Group();

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(OBSTACLE_RADIUS, OBSTACLE_HEIGHT, 6),
    new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
    }),
  );
  cone.position.y = OBSTACLE_HEIGHT * 0.5;
  group.add(cone);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(
      OBSTACLE_RADIUS * 0.9,
      OBSTACLE_RADIUS * 0.9,
      0.4,
      6,
    ),
    new THREE.MeshPhongMaterial({ color: 0x222222 }),
  );
  base.position.y = OBSTACLE_HEIGHT * 0.5;
  group.add(base);

  return group;
};

export type ObstacleType = 'cone' | 'block';

export class Obstacle {
  readonly mesh: THREE.Group;
  readonly position = new THREE.Vector3();
  readonly radius: number;

  constructor(x: number, z: number, type: ObstacleType = 'cone') {
    this.position.set(x, 0, z);
    this.radius = OBSTACLE_RADIUS;

    const color = type === 'cone' ? 0xff3366 : 0x00ffff;
    this.mesh = createObstacleMesh(color);
    this.mesh.position.copy(this.position);
    this.mesh.position.y = 0;
  }

  update(dt: number) {
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y += dt * 1.5;
    this.mesh.position.y = Math.sin(Date.now() * 0.004) * 0.15;
  }

  getBounds(): { min: THREE.Vector3; max: THREE.Vector3 } {
    const min = new THREE.Vector3(
      this.position.x - this.radius,
      0,
      this.position.z - this.radius,
    );
    const max = new THREE.Vector3(
      this.position.x + this.radius,
      OBSTACLE_HEIGHT,
      this.position.z + this.radius,
    );
    return { min, max };
  }

  collidesWith(carX: number, carZ: number, carRadius: number): boolean {
    const dx = carX - this.position.x;
    const dz = carZ - this.position.z;
    const distSq = dx * dx + dz * dz;
    const combined = this.radius + carRadius;
    return distSq < combined * combined;
  }
}
