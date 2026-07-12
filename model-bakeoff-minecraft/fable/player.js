/* 迷你我的世界 —— 玩家物理：重力、AABB 碰撞（逐轴扫掠）、游泳 */
window.MC = window.MC || {};
(function (MC) {
  'use strict';

  const B = MC.Blocks;

  const WIDTH = 0.6;        // 玩家碰撞盒宽（X/Z）
  const HEIGHT = 1.8;       // 碰撞盒高
  const EYE = 1.62;         // 眼睛离脚底高度
  const GRAVITY = 24;
  const JUMP_SPEED = 8.2;
  const WALK_SPEED = 4.5;
  const SPRINT_SPEED = 7.0;
  const SWIM_SPEED = 3.0;
  const MAX_STEP = 0.05;    // 物理子步最大位移，防止高速穿墙

  class Player {
    constructor(world) {
      this.world = world;
      this.pos = { x: 0, y: 0, z: 0 }; // 脚底中心
      this.vel = { x: 0, y: 0, z: 0 };
      this.onGround = false;
      this.inWater = false;
    }

    spawn(x, z) {
      // 从中心向外找一块干燥的草地出生点
      let bx = x | 0, bz = z | 0;
      outer:
      for (let r = 0; r < 40; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
            const sx = (x | 0) + dx, sz = (z | 0) + dz;
            const sy = this.world.surfaceY(sx, sz);
            if (sy > MC.WATER_LEVEL && this.world.get(sx, sy, sz) === B.GRASS) {
              bx = sx; bz = sz;
              break outer;
            }
          }
        }
      }
      const y = this.world.surfaceY(bx, bz);
      this.pos.x = bx + 0.5;
      this.pos.z = bz + 0.5;
      this.pos.y = y + 1.01;
      this.vel.x = this.vel.y = this.vel.z = 0;
    }

    eyePos() {
      return { x: this.pos.x, y: this.pos.y + EYE, z: this.pos.z };
    }

    // 碰撞盒是否与任意实心方块重叠
    collides(px, py, pz) {
      const w = WIDTH / 2;
      const x0 = Math.floor(px - w), x1 = Math.floor(px + w);
      const y0 = Math.floor(py), y1 = Math.floor(py + HEIGHT - 1e-6);
      const z0 = Math.floor(pz - w), z1 = Math.floor(pz + w);
      for (let y = y0; y <= y1; y++) {
        for (let z = z0; z <= z1; z++) {
          for (let x = x0; x <= x1; x++) {
            if (this.world.isSolid(x, y, z)) return true;
          }
        }
      }
      return false;
    }

    // 放置方块前检测：该方块是否与玩家碰撞盒重叠
    intersectsBlock(bx, by, bz) {
      const w = WIDTH / 2;
      return (
        bx + 1 > this.pos.x - w && bx < this.pos.x + w &&
        bz + 1 > this.pos.z - w && bz < this.pos.z + w &&
        by + 1 > this.pos.y && by < this.pos.y + HEIGHT
      );
    }

    /**
     * @param dt 秒
     * @param input { forward, back, left, right, jump, sprint } 布尔
     * @param yaw 相机水平朝向（弧度，Three.js 约定：0 朝 -Z）
     */
    update(dt, input, yaw) {
      dt = Math.min(dt, 0.05);
      const world = this.world;

      // 头部或躯干在水里即视为在水中
      const feet = world.get(Math.floor(this.pos.x), Math.floor(this.pos.y + 0.4), Math.floor(this.pos.z));
      const head = world.get(Math.floor(this.pos.x), Math.floor(this.pos.y + EYE), Math.floor(this.pos.z));
      this.inWater = feet === B.WATER || head === B.WATER;

      // 期望水平速度（相对朝向）
      let mx = 0, mz = 0;
      if (input.forward) mz -= 1;
      if (input.back) mz += 1;
      if (input.left) mx -= 1;
      if (input.right) mx += 1;
      const len = Math.hypot(mx, mz);
      let speed = this.inWater ? SWIM_SPEED : (input.sprint ? SPRINT_SPEED : WALK_SPEED);
      if (len > 0) { mx /= len; mz /= len; }
      const sin = Math.sin(yaw), cos = Math.cos(yaw);
      const wishX = (mx * cos - mz * sin) * speed;
      const wishZ = (mx * sin + mz * cos) * speed;

      // 水平速度平滑趋近（地面响应快，空中慢）
      const accel = this.onGround ? 20 : (this.inWater ? 8 : 5);
      const k = Math.min(1, accel * dt);
      this.vel.x += (wishX - this.vel.x) * k;
      this.vel.z += (wishZ - this.vel.z) * k;

      // 垂直：重力 / 游泳 / 跳跃
      if (this.inWater) {
        this.vel.y -= GRAVITY * 0.28 * dt;
        this.vel.y *= Math.pow(0.02, dt); // 水阻
        if (input.jump) this.vel.y = Math.min(this.vel.y + 30 * dt, 3.6);
      } else {
        this.vel.y -= GRAVITY * dt;
        if (input.jump && this.onGround) {
          this.vel.y = JUMP_SPEED;
          this.onGround = false;
        }
      }
      this.vel.y = Math.max(this.vel.y, -50);

      // 逐轴扫掠移动（分子步防穿透）
      this.onGround = false;
      this.moveAxis('x', this.vel.x * dt);
      this.moveAxis('z', this.vel.z * dt);
      this.moveAxis('y', this.vel.y * dt);

      // 世界边界（不可掉出世界）
      const margin = WIDTH / 2 + 0.01;
      this.pos.x = Math.max(margin, Math.min(MC.SIZE_X - margin, this.pos.x));
      this.pos.z = Math.max(margin, Math.min(MC.SIZE_Z - margin, this.pos.z));
      if (this.pos.y < 0.5) { this.pos.y = 0.5; this.vel.y = 0; this.onGround = true; }
    }

    moveAxis(axis, delta) {
      if (delta === 0) return;
      const steps = Math.max(1, Math.ceil(Math.abs(delta) / MAX_STEP));
      const step = delta / steps;
      for (let i = 0; i < steps; i++) {
        const nx = this.pos.x + (axis === 'x' ? step : 0);
        const ny = this.pos.y + (axis === 'y' ? step : 0);
        const nz = this.pos.z + (axis === 'z' ? step : 0);
        if (this.collides(nx, ny, nz)) {
          if (axis === 'y') {
            if (step < 0) this.onGround = true;
            this.vel.y = 0;
          } else if (axis === 'x') {
            this.vel.x = 0;
          } else {
            this.vel.z = 0;
          }
          return;
        }
        this.pos.x = nx; this.pos.y = ny; this.pos.z = nz;
      }
    }
  }

  MC.Player = Player;
  MC.PLAYER_EYE = EYE;
})(window.MC);
