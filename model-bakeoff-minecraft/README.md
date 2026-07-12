# 迷你「我的世界」模型对比 Demo

五个子 agent（不同指定模型）各自用 Three.js 做的可玩迷你 Minecraft 复刻，方便肉眼对比能力差异。

| 目录 | 指定模型 |
|------|----------|
| `fable/` | Claude Fable 5 thinking xhigh |
| `grok/` | Grok 4.5 fast xhigh |
| `gpt56/` | GPT-5.6 Sol xhigh fast |
| `composer/` | Composer 2.5 fast |
| `opus/` | Claude Opus 4.8 thinking high fast |

## 怎么玩

这些页面用了 ES Module，**不能直接双击 HTML**，需要起本地静态服务：

```bash
cd model-bakeoff-minecraft
python3 -m http.server 8877
```

然后浏览器打开：

- http://127.0.0.1:8877/fable/
- http://127.0.0.1:8877/grok/
- http://127.0.0.1:8877/gpt56/
- http://127.0.0.1:8877/composer/
- http://127.0.0.1:8877/opus/

## 操作

- 点击页面开始（锁定鼠标）
- WASD 移动，鼠标转视角，空格跳跃
- 左键破坏，右键放置
- 数字键 1–4 切换方块

详见各目录 `README.md` 与根目录 `SPEC.md`。
