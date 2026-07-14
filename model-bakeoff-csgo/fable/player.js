"use strict";
// player.js — 玩家：PointerLock 视角、WASD、跳跃、下蹲、重力、AABB 碰撞
// 同时导出 CS.movePhysics 供 BOT 复用同一套碰撞物理
window.CS = window.CS || {};

// ============ 通用 AABB 扫掠物理 ============
// body: {pos:{x,y,z}, vel:{x,y,z}, radius, height, onGround}
// pos 为脚底位置。逐轴移动 + 分子步，防止高速穿墙。
CS.movePhysics = function (body, dt, colliders, bounds) {
  const r = body.radius, h = body.height;
  const STEP_UP = 0.55; // 可自动跨上的台阶高度

  function overlaps(px, py, pz) {
    for (const c of colliders) {
      if (
        px + r > c.x1 && px - r < c.x2 &&
        py + h > c.y1 && py < c.y2 &&
        pz + r > c.z1 && pz - r < c.z2
      ) return c;
    }
    return null;
  }

  const steps = Math.max(1, Math.ceil((Math.abs(body.vel.x) + Math.abs(body.vel.y) + Math.abs(body.vel.z)) * dt / 0.5));
  const sdt = dt / steps;

  for (let s = 0; s < steps; s++) {
    // X 轴
    let nx = body.pos.x + body.vel.x * sdt;
    let hit = overlaps(nx, body.pos.y, body.pos.z);
    if (hit) {
      // 尝试跨台阶
      if (body.onGround && hit.y2 - body.pos.y <= STEP_UP && !overlaps(nx, hit.y2 + 0.001, body.pos.z)) {
        body.pos.y = hit.y2 + 0.001;
        body.pos.x = nx;
      } else {
        body.pos.x = body.vel.x > 0 ? hit.x1 - r - 0.001 : hit.x2 + r + 0.001;
        body.vel.x = 0;
      }
    } else body.pos.x = nx;

    // Z 轴
    let nz = body.pos.z + body.vel.z * sdt;
    hit = overlaps(body.pos.x, body.pos.y, nz);
    if (hit) {
      if (body.onGround && hit.y2 - body.pos.y <= STEP_UP && !overlaps(body.pos.x, hit.y2 + 0.001, nz)) {
        body.pos.y = hit.y2 + 0.001;
        body.pos.z = nz;
      } else {
        body.pos.z = body.vel.z > 0 ? hit.z1 - r - 0.001 : hit.z2 + r + 0.001;
        body.vel.z = 0;
      }
    } else body.pos.z = nz;

    // Y 轴
    let ny = body.pos.y + body.vel.y * sdt;
    body.onGround = false;
    if (ny <= 0 && body.vel.y <= 0) {
      body.pos.y = 0; body.vel.y = 0; body.onGround = true;
    } else {
      hit = overlaps(body.pos.x, ny, body.pos.z);
      if (hit) {
        if (body.vel.y <= 0) {
          body.pos.y = hit.y2 + 0.001;
          body.onGround = true;
        } else {
          body.pos.y = hit.y1 - h - 0.001;
        }
        body.vel.y = 0;
      } else body.pos.y = ny;
    }
  }

  // 世界边界
  const pad = 1.0;
  body.pos.x = Math.max(bounds.min + pad, Math.min(bounds.max - pad, body.pos.x));
  body.pos.z = Math.max(bounds.min + pad, Math.min(bounds.max - pad, body.pos.z));
};

// ============ 玩家 ============
CS.createPlayer = function (THREE, map, camera) {
  const STAND_H = 1.8, CROUCH_H = 1.2, EYE_OFF = 0.12;
  const WALK_SPEED = 7.2, CROUCH_SPEED = 3.4, JUMP_V = 5.4, GRAVITY = 17;

  const player = {
    pos: { x: 0, y: 0, z: 50 },
    vel: { x: 0, y: 0, z: 0 },
    radius: 0.42,
    height: STAND_H,
    onGround: true,
    yaw: 0, pitch: 0,
    crouching: false,
    eyeHeight: STAND_H - EYE_OFF,
    team: "T",
    hp: 100, armor: 0, money: 800,
    alive: true,
    kills: 0, deaths: 0, assists: 0,
    hasBomb: false,
    hasKit: false,
    lastFired: -99,
    name: "你",
    isHuman: true,
    speedFactor: 1, // 当前水平速度占满速比例（用于扩散）
    keys: {},
    recoilPitch: 0, // 后坐力视角上抬（weapons.js 写入，app.js 恢复）
  };

  player.spawnAt = function (sp) {
    player.pos.x = sp.x; player.pos.z = sp.z;
    player.pos.y = map.groundHeight(sp.x, sp.z, 3) + 0.01;
    player.vel.x = player.vel.y = player.vel.z = 0;
    player.yaw = sp.yaw; player.pitch = 0;
    player.hp = 100; player.alive = true;
    player.crouching = false;
    player.height = STAND_H;
    player.recoilPitch = 0;
  };

  player.onMouseMove = function (dx, dy, sens) {
    player.yaw -= dx * sens;
    player.pitch -= dy * sens;
    const lim = Math.PI / 2 - 0.01;
    player.pitch = Math.max(-lim, Math.min(lim, player.pitch));
  };

  // 头顶是否有障碍（不能起身）
  function ceilingBlocked() {
    const r = player.radius;
    for (const c of map.colliders) {
      if (
        player.pos.x + r > c.x1 && player.pos.x - r < c.x2 &&
        player.pos.y + STAND_H > c.y1 && player.pos.y < c.y2 &&
        player.pos.z + r > c.z1 && player.pos.z - r < c.z2
      ) return true;
    }
    return false;
  }

  player.update = function (dt) {
    if (!player.alive) {
      camera.position.set(player.pos.x, player.pos.y + 2.2, player.pos.z);
      camera.rotation.set(player.pitch, player.yaw, 0, "YXZ");
      return;
    }
    const k = player.keys;

    // 下蹲
    const wantCrouch = !!(k["ShiftLeft"] || k["ShiftRight"] || k["ControlLeft"] || k["ControlRight"]);
    if (wantCrouch && !player.crouching) {
      player.crouching = true;
      player.height = CROUCH_H;
    } else if (!wantCrouch && player.crouching && !ceilingBlocked()) {
      player.crouching = false;
      player.height = STAND_H;
    }
    // 视线高度平滑过渡
    const targetEye = (player.crouching ? CROUCH_H : STAND_H) - EYE_OFF;
    player.eyeHeight += (targetEye - player.eyeHeight) * Math.min(1, dt * 14);

    // 移动输入
    let fw = 0, st = 0;
    if (k["KeyW"] || k["ArrowUp"]) fw += 1;
    if (k["KeyS"] || k["ArrowDown"]) fw -= 1;
    if (k["KeyD"] || k["ArrowRight"]) st += 1;
    if (k["KeyA"] || k["ArrowLeft"]) st -= 1;
    const len = Math.hypot(fw, st);
    if (len > 0) { fw /= len; st /= len; }

    const speed = player.crouching ? CROUCH_SPEED : WALK_SPEED;
    const sy = Math.sin(player.yaw), cy = Math.cos(player.yaw);
    const wishX = (-sy * fw + cy * st) * speed;
    const wishZ = (-cy * fw - sy * st) * speed;

    // 地面加速快、空中弱操控
    const accel = player.onGround ? 12 : 2.5;
    player.vel.x += (wishX - player.vel.x) * Math.min(1, accel * dt);
    player.vel.z += (wishZ - player.vel.z) * Math.min(1, accel * dt);

    // 跳跃
    if (k["Space"] && player.onGround) {
      player.vel.y = JUMP_V;
      player.onGround = false;
      CS.audio.jump();
    }
    player.vel.y -= GRAVITY * dt;

    CS.movePhysics(player, dt, map.colliders, map.bounds);

    player.speedFactor = Math.min(1, Math.hypot(player.vel.x, player.vel.z) / WALK_SPEED);

    // 脚步声
    if (player.onGround && player.speedFactor > 0.4) {
      player._stepT = (player._stepT || 0) + dt * player.speedFactor;
      if (player._stepT > 0.38) {
        player._stepT = 0;
        CS.audio.footstep();
      }
    }

    // 相机
    camera.position.set(player.pos.x, player.pos.y + player.eyeHeight, player.pos.z);
    camera.rotation.set(player.pitch + player.recoilPitch, player.yaw, 0, "YXZ");
  };

  player.eyePos = function () {
    return new THREE.Vector3(player.pos.x, player.pos.y + player.eyeHeight, player.pos.z);
  };

  return player;
};
