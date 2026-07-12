# 迷你我的世界

基于 Three.js 的第一人称体素沙盒，打开 `index.html` 即可游玩，无需构建或安装依赖。

## 操作

| 操作 | 按键 |
|------|------|
| 移动 | W A S D |
| 跳跃 | 空格 |
| 视角 | 鼠标（需点击画面锁定指针） |
| 破坏方块 | 左键 |
| 放置方块 | 右键 |
| 切换方块 | 1 草 · 2 土 · 3 石 · 4 木 |

## 文件

- `index.html` — 入口页
- `app.js` — 主循环与交互
- `world.js` — 地形生成与世界网格
- `player.js` — 第一人称移动、重力与碰撞
- `blocks.js` — 方块类型与网格面片
- `style.css` — 界面与热键栏样式

## 特性

- 程序生成起伏地形（草地 / 泥土 / 石头分层）
- 随机树木（木干）
- 白天天空与定向光
- 十字准星、热键栏、方块高亮轮廓
- 破坏方块时的简单粒子效果
- 重力、跳跃、AABB 碰撞，不可穿墙

## 技术

- Three.js r160（jsDelivr CDN）
- PointerLockControls（Three.js addons）
- 原生 ES 模块，无 npm

## 运行

用任意静态 HTTP 服务器打开（ES 模块需 HTTP，不能直接 `file://`）：

```bash
cd /tmp/minecraft-bakeoff/composer
python3 -m http.server 8080
```

浏览器访问 `http://localhost:8080`，点击画面开始。
