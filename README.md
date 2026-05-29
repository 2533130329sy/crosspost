# CrossPost — 多平台内容发布工具

帮助创作者在微信公众号、知乎、B站、小红书、抖音同步发布内容。**"内容流的降维与升维"**。

```
上传图片/视频 → AI提取事实 → 生成多平台文案 → 适配格式 → 一键模拟发布
粘贴Markdown长文 → AI提炼浓缩 → 生成短文平台版本 → 适配格式 → 一键模拟发布
```

## 快速开始

```bash
# 前置条件
Node.js >= 18
pnpm >= 9

# 安装
pnpm install

# 配置 AI（可选，不配置则 AI 功能不可用但其他功能正常）
cp .env.example .env
# 编辑 .env 填入 ANTHROPIC_API_KEY

# 开发
pnpm dev:frontend   # http://localhost:5173
pnpm dev:backend    # http://localhost:3001

# 构建 & 测试
pnpm build
pnpm test
```

## 支持的平台

| 平台 | 类型 | 输出格式 | 标题 | 正文 |
|---|---|---|---|---|
| 公众号 | 长文流 | HTML | ≤64字 | ≤20000字 |
| 知乎 | 长文流 | Markdown | ≤100字 | 极宽松 |
| B站 | 长文流 | HTML | ≤100字 | ≤20000字 |
| 小红书 | 短文流 | 纯文本 | ≤20字 | ≤1000字 |
| 抖音 | 短文流 | 纯文本 | ≤55字 | ≤500字 |

## 架构

```
@crosspost/shared     类型 + 接口（无依赖）
    ↑
@crosspost/adapters   平台适配器（5个）
    ↑         ↑
@crosspost/frontend   @crosspost/backend
React + Vite           Express + Claude AI
```

### 核心模式

- **策略模式**：每个平台实现 `IPlatformAdapter` 接口
- **双基类**：`BaseAdapter`（长文流 Markdown→HTML）+ `BaseShortFormAdapter`（短文流 Markdown→纯文本）
- **多阶段 AI**：阶段1 事实提取 → 阶段2 平台专属 Writer Prompt 并发

### 添加新平台

1. 创建 `packages/adapters/src/newplatform/newplatform.adapter.ts`
2. 实现 `IPlatformAdapter`（继承 `BaseAdapter` 或 `BaseShortFormAdapter`）
3. 在 `packages/adapters/src/index.ts` 注册
4. 在 `packages/shared/src/types/platform.ts` 添加枚举值

仅需改 3 个文件。

## 项目结构

```
crosspost/
├── packages/
│   ├── shared/         @crosspost/shared — 类型+接口
│   ├── adapters/       @crosspost/adapters — 5个平台适配器
│   ├── frontend/       @crosspost/frontend — React前端
│   └── backend/        @crosspost/backend — Express后端 + Claude AI
├── docs/              标准文档（需求、架构、技术规范、设计规范）
├── dev-logs/          开发日志
└── CLAUDE.md           Claude Code 工作指引
```

## 未来发布演进

### 长文流（公众号、知乎、B站）：OAuth2 开放平台
通过官方 OAuth2 获取 access_token，调用官方发布 API。

### 短文流（小红书、抖音）：浏览器自动化
无官方发布 API，采用 Chrome Extension + Puppeteer/Playwright 方案，在用户浏览器中执行携带登录态，规避服务端 IP 风控。

## Demo 视频

（上传至 bilibili/云盘后放链接）

## 依赖说明

| 依赖 | 用途 |
|---|---|
| React 19 + Vite 6 | 前端框架 |
| @uiw/react-md-editor | Markdown 编辑器 |
| Express 5 | 后端框架 |
| unified/remark/rehype | Markdown ↔ HTML 转换 |
| Anthropic SDK | AI 文案生成 |
| Vitest | 测试框架 |
| Biome | 代码格式化和 Lint |
