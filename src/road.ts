import * as THREE from 'three';

import { Obstacle } from './obstacle';

const SEGMENT_LENGTH = 12;
const SEGMENT_WIDTH = 14;
const SEGMENTS_AHEAD = 14;
const SEGMENTS_BEHIND = 4;
const SPAWN_AHEAD = 90;
const OBSTACLE_SPAWN_CHANCE = 0.18;
const LANES = [-3.2, 0, 3.2];

const createSegmentMesh = (z: number) => {
  const geometry = new THREE.PlaneGeometry(SEGMENT_WIDTH, SEGMENT_LENGTH);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshPhongMaterial({
    color: 0x1a0026,
    emissive: 0x330044,
    emissiveIntensity: 0.4,
    shininess: 0,
  });
  const segment = new THREE.Mesh(geometry, material);
  segment.position.set(0, 0.02, z);
  return segment;
};

const createLaneLine = (z: number, x: number) => {
  const geometry = new THREE.PlaneGeometry(0.18, 2.4);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const line = new THREE.Mesh(geometry, material);
  line.position.set(x, 0.03, z);
  return line;
};

export class RoadManager {
  private segments: THREE.Mesh[] = [];
  private laneLines: THREE.Mesh[][] = [];
  private obstacles: Obstacle[] = [];
  private nextSegmentZ = 0;
  private lastSpawnZ = -SPAWN_AHEAD;
  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    for (let i = 0; i < SEGMENTS_AHEAD; i++) {
      this.addSegment(this.nextSegmentZ);
      this.nextSegmentZ -= SEGMENT_LENGTH;
    }
  }

  private addSegment(z: number) {
    const segment = createSegmentMesh(z);
    this.scene.add(segment);
    this.segments.push(segment);

    const lines: THREE.Mesh[] = [];
    for (const laneX of LANES) {
      const line = createLaneLine(z, laneX);
      this.scene.add(line);
      lines.push(line);
    }
    this.laneLines.push(lines);
  }

  private cullSegments(carZ: number) {
    while (
      this.segments.length > 0 &&
      this.segments[0].position.z > carZ + SEGMENT_LENGTH * SEGMENTS_BEHIND
    ) {
      const segment = this.segments.shift();
      if (segment) {
        this.scene.remove(segment);
        const lines = this.laneLines.shift();
        if (lines) {
          for (const line of lines) {
            this.scene.remove(line);
          }
        }
      }
    }
  }

  private spawnObstacles(carZ: number, difficulty: number) {
    const spawnZ = carZ - SPAWN_AHEAD;
    if (this.lastSpawnZ - spawnZ < SEGMENT_LENGTH) return;

    for (
      let z = this.lastSpawnZ - SEGMENT_LENGTH;
      z >= spawnZ;
      z -= SEGMENT_LENGTH
    ) {
      if (Math.random() > OBSTACLE_SPAWN_CHANCE * (1 + difficulty * 0.6))
        continue;
      const laneX = LANES[Math.floor(Math.random() * LANES.length)];
      const obstacle = new Obstacle(laneX, z);
      this.scene.add(obstacle.mesh);
      this.obstacles.push(obstacle);
    }
    this.lastSpawnZ = spawnZ;
  }

  private cullObstacles(carZ: number) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      if (obstacle.position.z > carZ + SEGMENT_LENGTH * SEGMENTS_BEHIND) {
        this.scene.remove(obstacle.mesh);
        this.obstacles.splice(i, 1);
      }
    }
  }

  update(carZ: number, difficulty: number) {
    while (
      this.segments[this.segments.length - 1].position.z >
      carZ - SEGMENT_LENGTH * 2
    ) {
      this.addSegment(
        this.segments[this.segments.length - 1].position.z - SEGMENT_LENGTH,
      );
    }
    this.cullSegments(carZ);
    this.spawnObstacles(carZ, difficulty);
    this.cullObstacles(carZ);

    for (const obstacle of this.obstacles) {
      obstacle.update(1 / 60);
    }
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  reset() {
    for (const segment of this.segments) {
      this.scene.remove(segment);
    }
    for (const lines of this.laneLines) {
      for (const line of lines) {
        this.scene.remove(line);
      }
    }
    for (const obstacle of this.obstacles) {
      this.scene.remove(obstacle.mesh);
    }
    this.segments = [];
    this.laneLines = [];
    this.obstacles = [];
    this.nextSegmentZ = 0;
    this.lastSpawnZ = -SPAWN_AHEAD;
    for (let i = 0; i < SEGMENTS_AHEAD; i++) {
      this.addSegment(this.nextSegmentZ);
      this.nextSegmentZ -= SEGMENT_LENGTH;
    }
  }
}
