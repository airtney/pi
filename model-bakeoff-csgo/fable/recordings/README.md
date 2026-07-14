# 比赛录像 — 自动化录制说明

本目录是对 `fable/`（Three.js 迷你 CS:GO）**一场完整比赛**的自动化录像，
全程在无显示器的 Linux 环境中用无头 Chrome 完成，未修改任何游戏源代码。

## 产物

| 文件 | 说明 |
| --- | --- |
| `match.webm` | 整场比赛视频，1280x634 VP9 / 24fps，约 11 分 27 秒（实时时长），9 个回合 + 终场结算 |
| `frame-001.png` … `frame-024.png` | 等间隔取自整场比赛的 24 张截图（开始界面 → 交战 → 换边 → 终场） |
| `storyboard.jpg` | 上述 24 帧的 4x6 拼图故事板 |
| `match-end.png` | 终场结算画面全分辨率截图（比分 8:1，MVP 领奖台） |
| `session.json` | 比赛记录：开始时间、服务器、阵营、逐回合比分、事件、所用工具 |
| `record.mjs` | 录制主脚本（CDP 驱动 + 逐帧抓图），可复现 |
| `autopilot.js` | 注入页面的自动驾驶脚本（操控人类玩家槽位） |

## 这场比赛

- 阵营：脚本点击「T 恐怖分子」入场；上半场 0:4 落后，第 4 回合后触发**半场换边**（比分随队伍带走变为 4:0，玩家改打 CT）。
- 终局：**T 8 : 1 CT**，玩家所在队 1:8 落败。MVP 为敌方 BOT **Pirate**（14 杀 / 8 助攻 / 3 死）。
- 玩家槽位由 `autopilot.js` 驾驶：复用游戏内置路点图做 Dijkstra 寻路、视线索敌开火、购买时间自动买枪买甲、携带 C4 时去包点长按 E 安放、卡住自动跳。实力不敌 BOT，9 回合全部阵亡（0 杀 9 死）；阵亡后游戏自动切到**观战队友第一人称**，因此录像中战斗过程（交火、曳光、击杀信息流、下包/拆包）依旧完整可见。
- 完整逐回合比分与 45 次击杀事件见 `session.json`。

## 录制原理

1. **静态服务器**：在 `fable/` 目录下 `python3 -m http.server 8765 --bind 127.0.0.1`（跑在 tmux 会话里）。
2. **无头 Chrome**：`google-chrome --headless=new --no-sandbox --enable-unsafe-swiftshader`
   （SwiftShader 提供软件 WebGL，无 GPU 也能渲染 Three.js，帧率约 10 FPS）。
3. **CDP 控制**（原生 WebSocket 直连 DevTools 协议，未用 puppeteer/playwright）：
   - `Page.addScriptToEvaluateOnNewDocument` 预置 `window.CS_DEBUG_NOLOCK = true` —— 这是游戏自带的调试开关，允许无 PointerLock（无头环境拿不到鼠标锁）时继续运行主循环；
   - `Runtime.evaluate` 点击 `#btn-join-t` 入场，并注入 `autopilot.js`；
   - `Page.startScreencast`（JPEG q80, 1280x720）逐帧抓图，共 **7859 帧**，平均 11.4 FPS，每帧带真实时间戳；
   - 每 2 秒轮询一次比分/血量/经济，写入进度日志；`round.matchOver` 为真后再录 7 秒结算画面收尾。
4. **合成视频**：按 screencast 真实时间戳生成 ffmpeg concat 清单（每帧标注实际时长），再编码：

   ```bash
   ffmpeg -f concat -safe 0 -i concat.txt -vf fps=24,scale=1280:-2 \
     -c:v libvpx-vp9 -b:v 0 -crf 34 -deadline realtime -cpu-used 8 -row-mt 1 match.webm
   ```

   因此视频时长 = 真实比赛时长（约 687 秒），不是简单按固定帧率堆帧。

## 如何观看 / 复现

**观看**：`match.webm` 任何现代浏览器或 `ffplay match.webm` 直接播放；快速浏览看 `storyboard.jpg`。

**重新录一场**：

```bash
# 1. 起服务器（在 fable/ 目录）
python3 -m http.server 8765 --bind 127.0.0.1 &

# 2. 准备工作目录（record.mjs 默认用 /tmp/csgo-record-1，可用 CSGO_RECORD_BASE 覆盖）
mkdir -p /tmp/csgo-record-1
cp recordings/record.mjs recordings/autopilot.js /tmp/csgo-record-1/

# 3. 录制（Node 22+，无需 npm 依赖；需要 google-chrome 与联网加载 Three.js CDN）
node /tmp/csgo-record-1/record.mjs
# 结束后 /tmp/csgo-record-1/ 下有 frames/、timing.json、status.json

# 4. 合成视频：按 timing.json 的帧时间戳生成 concat 清单后跑上面的 ffmpeg 命令
```

想换阵营录 CT，把 `record.mjs` 里 `const TEAM = "T"` 改成 `"CT"` 即可（autopilot 会自动买拆弹钳并回防拆包）。
