# Plan: Low-poly synthwave endless racing game

## Goal

Turn the existing Three.js + jsx-dom scaffolding (`src/main.ts`, `src/renderer.ts`, `src/scene.ts`) into a playable low-poly synthwave endless racer. Arrow keys steer left/right and accelerate; hold Shift to drift.

## Decisions

- **Controls**: Up arrow accelerate, Down arrow brake/reverse, Left/Right steer, Shift drift. Confirmed by user request.
- **Audio**: Yes — synthwave music + engine/drift/crash SFX generated via Web Audio API (no external audio assets).
- **Game flow**: Start screen first (title + "Press SPACE to start"), then gameplay; game over overlay shows score + restart.
- **Difficulty**: Yes — forward speed and obstacle density increase as distance grows.
- **Assets**: Fully procedural geometry (boxes, cones, spheres, planes). No external models/textures. Asset paths (none) follow the no-leading-slash rule.
- **Tech**: Three.js r0.187, jsx-dom 8 for UI overlays, Tailwind CSS 4, TypeScript 6 strict. Follow existing file conventions (kebab-case files, camelCase functions, PascalCase classes, UPPER_SNAKE_CASE constants).

## Data flow

1. `main.ts` runs the animation loop: `input.poll()` → `game.update(dt)` → `renderer.render(scene, camera)`.
2. `input.ts` tracks arrow keys + Shift state each frame.
3. `car.ts` reads input, applies steering/acceleration/drift physics, updates its mesh transform.
4. `road.ts` spawns road segments and obstacles ahead of the car, culls segments behind it.
5. `environment.ts` respawns mountains/trees/sun ahead of the car and culls behind it (so scenery never disappears).
6. `game.ts` (GameStateManager) owns state (menu/playing/gameOver), score, speed, difficulty, runs circle-based collision car-vs-obstacle, triggers transitions and restart.
7. `audio.ts` plays music on start, engine pitch scaled by speed, drift SFX while drifting, crash SFX on collision.
8. `ui.tsx` renders jsx-dom overlays (start screen, HUD score/speed, game over) layered over the canvas.

## Files

- `src/scene.ts` — extend: fog, ambient + directional sun light, neon grid floor, low-poly sun/mountains/palm trees, synthwave sky color.
- `src/input.ts` (new) — keyboard state tracker (arrows, Shift, Space).
- `src/car.ts` (new) — `Car` class: low-poly mesh, velocity/steering/drift physics, `update(dt, input)`.
- `src/road.ts` (new) — `RoadManager`: procedural segment generation, obstacle placement ahead, culling behind.
- `src/obstacle.ts` (new) — `Obstacle` class: low-poly mesh, bounds for collision.
- `src/audio.ts` (new) — `AudioManager`: Web Audio API synth music + SFX.
- `src/ui.tsx` (new) — jsx-dom overlays: start screen, HUD, game over (React-style function components, `useText`, `useClassList`, `useRef`)
- `src/environment.ts` (new) — `EnvironmentManager`: respawns mountains/trees/sun ahead of car, culls behind
- `src/game.ts` (new) — `GameStateManager`: state machine, score, speed, difficulty, collision, restart.
- `src/main.ts` — wire systems into the animation loop.

## Risks / notes

- Collision uses simple distance/AABB checks; fine for low-poly prototyping.
- Web Audio API requires user gesture; music starts on the SPACE press that begins the game.
