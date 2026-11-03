import * as THREE from 'three';

const createSunMesh = () => {
  const geometry = new THREE.IcosahedronGeometry(8, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff3366 });
  const sun = new THREE.Mesh(geometry, material);
  return sun;
};

const createMountain = (x: number, z: number, scale: number) => {
  const geometry = new THREE.ConeGeometry(4 * scale, 10 * scale, 4);
  const material = new THREE.MeshPhongMaterial({ color: 0x220033 });
  const mountain = new THREE.Mesh(geometry, material);
  mountain.position.set(x, 5 * scale, z);
  return mountain;
};

const createPalmTree = (x: number, z: number) => {
  const group = new THREE.Group();

  const trunkGeometry = new THREE.CylinderGeometry(0.6, 0.9, 5, 6);
  const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x442211 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 2.5;
  group.add(trunk);

  for (let i = 0; i < 6; i++) {
    const leafGeometry = new THREE.ConeGeometry(1.5, 4, 4);
    const leafMaterial = new THREE.MeshPhongMaterial({ color: 0x00aa44 });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(0, 5 + i * 0.8, 0);
    leaf.rotation.z = (i / 6) * Math.PI * 2;
    group.add(leaf);
  }

  group.position.set(x, 0, z);
  return group;
};

export class EnvironmentManager {
  private sun: THREE.Mesh;
  private mountains: THREE.Mesh[] = [];
  private palmTrees: THREE.Group[] = [];

  private readonly scene: THREE.Scene;
  private readonly sunLight: THREE.DirectionalLight;

  constructor(scene: THREE.Scene, sunLight: THREE.DirectionalLight) {
    this.scene = scene;
    this.sunLight = sunLight;
    this.sun = createSunMesh();
    scene.add(this.sun);
  }

  update(carX: number, carZ: number) {
    // keep the sun ahead of the car
    this.sun.position.set(carX - 60, 40, carZ - 80);
    this.sunLight.position.copy(this.sun.position);

    // cull and respawn mountains
    for (let i = this.mountains.length - 1; i >= 0; i--) {
      const m = this.mountains[i];
      if (m.position.z > carZ + 40) {
        this.scene.remove(m);
        this.mountains.splice(i, 1);
      }
    }
    while (this.mountains.length < 12) {
      const x = (Math.random() - 0.5) * 140 + carX;
      const z = carZ - 60 - Math.random() * 80;
      const scale = 0.8 + Math.random() * 1.2;
      const mountain = createMountain(x, z, scale);
      this.scene.add(mountain);
      this.mountains.push(mountain);
    }

    // cull and respawn palm trees
    for (let i = this.palmTrees.length - 1; i >= 0; i--) {
      const p = this.palmTrees[i];
      if (p.position.z > carZ + 40) {
        this.scene.remove(p);
        this.palmTrees.splice(i, 1);
      }
    }
    while (this.palmTrees.length < 16) {
      const x = (Math.random() - 0.5) * 100 + carX;
      const z = carZ - 40 - Math.random() * 60;
      const palm = createPalmTree(x, z);
      this.scene.add(palm);
      this.palmTrees.push(palm);
    }
  }

  reset() {
    for (const m of this.mountains) {
      this.scene.remove(m);
    }
    for (const p of this.palmTrees) {
      this.scene.remove(p);
    }
    this.mountains = [];
    this.palmTrees = [];
  }
}
