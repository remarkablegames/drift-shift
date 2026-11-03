import * as THREE from 'three';

const GRID_SIZE = 200;
const GRID_DIVISIONS = 40;

const createGrid = () => {
  const geometry = new THREE.PlaneGeometry(
    GRID_SIZE,
    GRID_SIZE,
    GRID_DIVISIONS,
    GRID_DIVISIONS,
  );
  geometry.rotateX(-Math.PI / 2);

  const positionArray = geometry.attributes.position.array;
  const colors: number[] = [];
  const count = positionArray.length / 3;

  for (let i = 0; i < count; i++) {
    const x = positionArray[i * 3];
    const z = positionArray[i * 3 + 2];
    const wave = Math.sin(x * 0.05 + z * 0.05) * 0.5 + 0.5;
    colors.push(0.2 + wave * 0.3, 0, 0.5 + wave * 0.5);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 0,
  });

  const grid = new THREE.Mesh(geometry, material);
  grid.position.y = 0.01;
  return grid;
};

export function createScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x110019, 0.02);
  scene.background = new THREE.Color(0x110019);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 4, 8);
  camera.lookAt(0, 0, -5);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xff3366, 1);
  sunLight.position.set(-60, 40, -80);
  scene.add(sunLight);

  const grid = createGrid();
  scene.add(grid);

  return { scene, camera, grid, sunLight };
}
