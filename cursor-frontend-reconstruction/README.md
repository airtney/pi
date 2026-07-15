# Cursor 官网首页前端复刻 (cursor-frontend-reconstruction)

对 [cursor.com](https://cursor.com) 营销首页的**前端逆向复刻**。使用 Next.js App
Router + TypeScript + Tailwind 重建，作为一次教学性质的逆向工程练习：**不打包原站
产物、不使用 iframe 嵌入、不复制任何服务端代码**,所有组件均依据公开的 HTML/CSS/JS
手工重写。

完整的复刻方法论见 [`REPLICA_CONCEPT.md`](./REPLICA_CONCEPT.md),本文件是其配套的
中文使用说明。

## 技术栈

- **Next.js 15 (App Router)** + React 19
- **TypeScript**(严格模式)
- **Tailwind CSS 3.4**,通过 `tailwind.config.ts` 映射从原站 CSS 提取的设计令牌
- 真实字体 **CursorGothic**(无衬线) 与 **BerkeleyMono**(等宽),镜像自 cursor.com CDN

## 快速开始

```bash
npm install
npm run dev     # 启动开发服务器,访问 http://localhost:3000
npm run build   # 生产构建(静态导出到 out/)
npm run start   # 在 0.0.0.0:3000 上以静态文件方式服务 out/(适合端口转发)
```

本项目使用 `output: "export"` 静态导出:`npm run build` 生成纯静态的
`out/` 目录,`npm run start` 用 Python 内置 HTTP 服务器直接提供这些
文件。相比 `next start`,静态文件不依赖 RSC 流式响应和 `Vary`/缓存
协商,在 Cloud Agent 端口转发代理后面最可靠。

## 目录结构

```
cursor-frontend-reconstruction/
├── app/                      # App Router(位于项目根目录,非 src/app)
│   ├── layout.tsx            # 根布局 + Header/Footer + 元数据
│   ├── page.tsx              # 首页,组合 11 个区块
│   ├── error.tsx             # 错误边界(复刻自模块 641852)
│   └── globals.css           # 设计令牌 + 组件类(.btn/.container/.type-*)
├── components/
│   ├── Button.tsx            # Button/ButtonBlock/Actions/Shell 高亮(模块 634408)
│   ├── ContextualDownloadButton.tsx  # 按平台自适应的下载按钮(模块 136952)
│   ├── Header.tsx / Footer.tsx / CursorLogo.tsx
│   ├── DemoWindow.tsx / Icons.tsx
│   └── sections/             # 首页各区块
├── lib/
│   ├── platform.ts           # 平台/架构探测(模块 733812 / 942982 / 229207)
│   ├── button.ts             # 按钮变体与对齐(模块 560817 / 861352)
│   ├── gt-shim.ts            # gt-next useGT() 本地替身
│   └── cn.ts                 # classnames 工具
├── public/                   # 真实字体、头像、团队照片、favicon
├── _artifacts/               # 抓取的原始产物(HTML/chunks/css/beautified)
├── tailwind.config.ts        # 从 CSS 提取的主题令牌
└── REPLICA_CONCEPT.md        # 复刻方法论
```

## 复刻要点

- **React Compiler 还原**:原站启用了 React Compiler,产物中充斥
  `useMemoCache(n)` / `(0,r.c)(n)` 与 `react.memo_cache_sentinel` 守卫,已全部还原
  为惯用的 `useState` / `useEffect` 与派生值。
- **Turbopack 模块解析**:模块以 `<id>, (e) => {...}` 声明,导出用
  `e.s(["Name", 0, fn], <id>)`,导入用 `e.i(<id>)`。据此定位关键模块 id 并映射到
  组件(详见 `REPLICA_CONCEPT.md` 的模块对照表)。
- **设计令牌**:`--color-theme-*`、`--text-*`、`--tracking-*`、`--spacing-g*/v*`
  等均从 `_artifacts/css/*.css` 提取,浅色主题 `bg #f7f7f4 / fg #26251e`。
- **i18n**:`gt-next` 的 `useGT()` 由 `lib/gt-shim.ts` 替换,仅保留 en-US 文案。

## 已知差距 / 非目标

- 原站的交互式产品演示(客户端 React 状态机)以**静态、视觉近似的窗口模型**呈现。
- 客户 Logo 墙以**淡化文字标记**表示(原站为内联 SVG,而非通过 URL 引用),以避免
  嵌入第三方商标素材。
- 仅复刻 en-US 首页路由;其它页面(定价、文档等)仅在导航中保留链接。

> 本项目仅用于前端逆向工程的学习与研究。所有品牌、商标及文案版权归 Anysphere, Inc.
> 所有。
