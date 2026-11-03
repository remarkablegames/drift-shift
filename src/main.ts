import * as THREE from 'three';

import { AudioManager } from './audio';
import { Car } from './car';
import { EnvironmentManager } from './environment';
import { GameStateManager } from './game';
import { Input } from './input';
import { createRenderer } from './renderer';
import { RoadManager } from './road';
import { createScene } from './scene';
import { UI } from './ui.tsx';

const { renderer } = createRenderer();
const { scene, camera, sunLight } = createScene();

const input = new Input();
const car = new Car();
scene.add(car.mesh);
const road = new RoadManager(scene);
const environment = new EnvironmentManager(scene, sunLight);

UI.setState('start');

const game = new GameStateManager(input, car, road, environment, AudioManager);
UI.onStart(() => {
  game.start();
});

const animate = (time: number) => {
  game.update(time);

  if (game.getState() === 'playing') {
    const followDist = 9 + car.getSpeed() * 0.1;
    const followHeight = 7 + car.getSpeed() * 0.03;
    const offset = new THREE.Vector3(
      -Math.sin(car.getYaw()) * followDist,
      followHeight,
      Math.cos(car.getYaw()) * followDist,
    );
    camera.position.copy(car.position).add(offset);
    camera.lookAt(car.position);
  } else {
    camera.position.set(0, 10, 8);
    camera.lookAt(0, 0, -5);
  }

  environment.update(car.position.x, car.position.z);

  renderer.render(scene, camera);
};

renderer.setAnimationLoop(animate);

document.getElementById('spinner')?.remove();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    renderer.setAnimationLoop(null);
  } else {
    renderer.setAnimationLoop(animate);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
