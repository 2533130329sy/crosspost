# CrossPost 架构设计

## 整体架构

```
@crosspost/shared (类型+接口，无依赖)
    ^
@crosspost/adapters (平台适配器，依赖 shared)
    ^           ^
@crosspost/frontend   @crosspost/backend
```

## 核心模式

### 平台适配器（Strategy Pattern）

每个平台实现 IPlatformAdapter 接口，通过适配器注册表管理。

### 双基类

- BaseAdapter: 长文流（公众号、知乎、B站），Markdown→HTML
- BaseShortFormAdapter: 短文流（小红书、抖音），Markdown→纯文本+截断

### AI 多阶段生成

- 阶段1: 事实提取（1次调用）
- 阶段2: 平台文案生成（N次并发，各平台专属 Prompt）

## 未来发布演进

### 长文流: OAuth2 开放平台
- 公众号、知乎、B站通过官方 OAuth2 接入

### 短文流: 浏览器自动化
- 小红书、抖音无官方发布API
- 方案: Chrome Extension + Puppeteer/Playwright
- 在用户浏览器中执行，规避服务端IP风控
