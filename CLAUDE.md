# CrossPost — Claude Code 工作指引

## 项目概述

CrossPost 是一个多平台内容发布工具，帮助创作者在微信公众号、知乎、B站、小红书、抖音同步发布内容。
核心卖点是"内容流的降维与升维"——长文流保证排版和代码块完美复现，短文流利用大模型进行语义级别的浓缩和语调重塑。

## 标准文件索引

### 项目文档
- [需求文档](docs/requirements.md) — 用户故事、核心功能
- [架构设计](docs/architecture.md) — 适配器模式、AI多阶段生成、风控演进
- [技术规范](docs/tech-specs.md) — 技术栈、代码规范、API规范
- [设计规范](docs/design-standards.md) — UI原则、组件设计、响应式
- [执行步骤](docs/execution-plan.md) — PR交付节奏、里程碑

### 平台格式参考
- [公众号](docs/platform-guides/wechat.md)
- [知乎](docs/platform-guides/zhihu.md)
- [B站](docs/platform-guides/bilibili.md)
- [小红书](docs/platform-guides/xiaohongshu.md)
- [抖音](docs/platform-guides/douyin.md)

### 开发日志
- [dev-logs/](dev-logs/) — 每日开发记录（模板：今日完成/遇到的问题/技术决策/明日计划）

### 计划文件
- [开发计划](C:\Users\25227\.claude\plans\lively-crafting-rivest.md) — 含30条风险与应对检查清单

## 工作原则

1. **严格按PR顺序推进**，一个PR完成再开始下一个
2. **每个PR只做一件事**，粒度小、描述清晰
3. **每个PR完成后立即commit**，保持持续交付记录
4. **主分支始终保持可运行**（build + test通过）
5. **每日结束前更新 dev-logs/**，禁止空话日志
6. **所有设计决策记录在 docs/** 中
7. **每个UI相关PR需在Chrome/iPad尺寸验证**无滚动条死锁
8. **所有用户可见的等待状态必须有进度指示器**，禁止纯静态Loading

## 常用命令

```bash
pnpm install          # 安装所有依赖
pnpm build            # 全量构建
pnpm test             # 运行所有测试
pnpm dev:frontend     # 启动前端 (localhost:5173)
pnpm dev:backend      # 启动后端 (localhost:3001)
pnpm lint             # Biome 检查
pnpm format:fix       # Biome 自动修复
```

## 项目结构

```
crosspost/
├── packages/
│   ├── shared/       # @crosspost/shared — 类型+接口
│   ├── adapters/     # @crosspost/adapters — 平台适配器
│   ├── frontend/     # @crosspost/frontend — React前端
│   └── backend/      # @crosspost/backend — Express后端
├── docs/             # 标准文档
└── dev-logs/         # 开发日志
```

## 风险清单速查

实现时须关注以下关键风险（详见计划文件第十章）：
- P1: 去矩阵化痕迹 — Prompt注入去模板化
- A2: 429 Rate Limit — 串行化+指数退避
- S1: API被薅羊毛 — 服务端Key+频控
- Q2: Emoji截断 — Intl.Segmenter
- D4: 视觉假死 — Step进度条
