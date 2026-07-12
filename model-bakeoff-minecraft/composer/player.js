import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { WORLD_H } from "./world.js";

const GRAVITY = 24;
const JUMP_SPEED = 8.5;
const MOVE_SPEED = 5.2;
const PLAYER_H = 1.75;
const PLAYER_R = 0.32;
const EYE_HEIGHT = 1.62;

export class Player {
  constructor(camera, domElement) {
    this.camera = camera;
    this.velocity = new THREE.Vector3();
    this.onGround = false;
    this.controls = new PointerLockControls(camera, domElement);
    this.move = { forward: false, backward: false, left: false, right: false, jump: false };
  }

  bindInput() {
    const setMove = (code, value) => {
      if (code === "KeyW") this.move.forward = value;
      if (code === "KeyS") this.move.backward = value;
      if (code === "KeyA") this.move.left = value;
      if (code === "KeyD") this.move.right = value;
      if (code === "Space") this.move.jump = value;
    };

    document.addEventListener("keydown", (e) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) {
        setMove(e.code, true);
      }
    });
    document.addEventListener("keyup", (e) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) {
        setMove(e.code, false);
      }
    });
  }

  lock() {
    this.controls.lock();
  }

  isLocked() {
    return this.controls.isLocked;
  }

  getPosition() {
    return this.controls.getObject().position;
  }

  getEyePosition() {
    return this.getPosition();
  }

  feetY(pos) {
    return pos.y - EYE_HEIGHT;
  }

  setPosition(x, y, z) {
    const p = this.getPosition();
    p.set(x, y, z);
    this.velocity.set(0, 0, 0);
  }

  update(dt, world) {
    if (!this.controls.isLocked) return;

    const pos = this.getPosition();
    const forward = new THREE.Vector3();
    this.controls.getDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() > 0) forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    const wish = new THREE.Vector3();
    if (this.move.forward) wish.add(forward);
    if (this.move.backward) wish.sub(forward);
    if (this.move.left) wish.sub(right);
    if (this.move.right) wish.add(right);
    if (wish.lengthSq() > 0) wish.normalize();

    this.velocity.x = wish.x * MOVE_SPEED;
    this.velocity.z = wish.z * MOVE_SPEED;

    if (this.onGround && this.move.jump) {
      this.velocity.y = JUMP_SPEED;
      this.onGround = false;
    }

    this.velocity.y -= GRAVITY * dt;

    this.resolveAxis(pos, world, "x", dt);
    this.resolveAxis(pos, world, "z", dt);
    this.resolveAxis(pos, world, "y", dt);

    if (pos.y < -5) {
      const spawn = world.findSpawn();
      this.setPosition(spawn.x, spawn.y, spawn.z);
    }
    if (pos.y > WORLD_H + 10) {
      this.velocity.y = Math.min(this.velocity.y, 0);
    }
  }

  resolveAxis(pos, world, axis, dt) {
    const delta = this.velocity[axis] * dt;
    if (delta === 0) return;

    pos[axis] += delta;
    const min = this.aabbMin(pos);
    const max = this.aabbMax(pos);
    let collided = false;

    for (let x = min.x; x <= max.x; x++) {
      for (let y = min.y; y <= max.y; y++) {
        for (let z = min.z; z <= max.z; z++) {
          if (!world.isSolid(x, y, z)) continue;
          collided = true;
          if (axis === "x") {
            pos.x = delta > 0 ? x - PLAYER_R : x + 1 + PLAYER_R;
            this.velocity.x = 0;
          } else if (axis === "z") {
            pos.z = delta > 0 ? z - PLAYER_R : z + 1 + PLAYER_R;
            this.velocity.z = 0;
          } else {
            if (delta > 0) {
              pos.y = y - PLAYER_H + EYE_HEIGHT;
              this.velocity.y = 0;
            } else {
              pos.y = y + 1 + EYE_HEIGHT;
              this.velocity.y = 0;
              this.onGround = true;
            }
          }
        }
      }
    }

    if (axis === "y" && !collided && delta < 0) {
      this.onGround = false;
    }
  }

  aabbMin(pos) {
    const fy = this.feetY(pos);
    return {
      x: Math.floor(pos.x - PLAYER_R),
      y: Math.floor(fy),
      z: Math.floor(pos.z - PLAYER_R),
    };
  }

  aabbMax(pos) {
    const fy = this.feetY(pos);
    return {
      x: Math.floor(pos.x + PLAYER_R),
      y: Math.floor(fy + PLAYER_H - 0.05),
      z: Math.floor(pos.z + PLAYER_R),
    };
  }

  occupiesBlock(x, y, z) {
    const pos = this.getPosition();
    const min = this.aabbMin(pos);
    const max = this.aabbMax(pos);
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y && z >= min.z && z <= max.z;
  }

  getLookDirection() {
    const dir = new THREE.Vector3();
    this.controls.getDirection(dir);
    return dir;
  }
}
