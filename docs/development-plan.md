# CrossPost — 多平台内容发布工具 开发计划 v4（PM评审修订版）

## 产品定位

**"内容流的降维与升维"** —— 长文流保证排版和代码块完美复现；短文流利用大模型进行语义级别的浓缩和语调重塑，让同一套素材在各平台呈现不同但适配的调性。

## 核心流程（双向驱动）

```
流向A（素材驱动）：上传图片/视频 → AI提取事实 → 生成多平台草稿 → 用户编辑 → 发布
流向B（长文驱动）：粘贴Markdown长文 → AI提炼浓缩 → 生成短文平台版本 → 用户编辑 → 发布
```

---

## 一、平台分析（修正版）

### 媒体资产是独立维度

| 平台 | 核心资产 | 文案角色 | 输出格式 |
|---|---|---|---|
| 公众号 | 封面图 | 长文正文 | HTML富文本 |
| 知乎 | 封面图(可选) | 深度长文 | Markdown变体 |
| B站专栏 | 封面图+配图 | 专栏正文 | HTML富文本 |
| 小红书 | **封面图(核心)** | 种草文案 | 纯文本 |
| 抖音 | **视频文件(核心)** | 视频描述 | 纯文本 |

### 各平台约束（修正版）

| 约束项 | 公众号 | 知乎 | B站专栏 | 小红书 | 抖音 |
|---|---|---|---|---|---|
| 标题 | ≤64字 | ≤100字 | ≤100字 | ≤20字 | ≤55字 |
| 正文 | ≤20000字 | 极宽松 | ≤20000字 | ≤1000字 | ≤500字 |
| 核心媒体 | 封面图 | 封面图(可选) | 封面图+配图 | 图片≥1张,≤10张 | 视频文件 |
| 输出格式 | HTML | Markdown | HTML | 纯文本 | 纯文本 |
| 代码块 | 是 | 是 | 是 | 否 | 否 |
| LaTeX | 否 | 是 | 否 | 否 | 否 |
| 话题标签 | 否 | 想法支持 | 尾部 | 核心 | 核心 |
| 视频 | 可插入 | 不支持 | BV号嵌入 | 独立笔记 | 原生上传 |

### 视频嵌入的务实处理

B站BV号、公众号视频ID等需要先在对应平台上传才能获取。工具策略：
- **预览阶段**：视频位置渲染为提示卡片 `[此处请在发布时手动插入您在当前平台上传的视频]`
- **未来**：接入平台OAuth后可自动上传并回填ID

---

## 二、AI 生成架构（多阶段）

### 不再使用单Prompt生成所有平台文案

```
阶段1（事实提取，1次调用）
  输入: 用户上传的图片(base64) + 可选文字描述
      或: 用户粘贴的Markdown长文
  输出: JSON结构化事实
        { "topic": "...", "keyPoints": [...], "entities": [...], "tone": "..." }

阶段2（平台文案生成，N次并发调用）
  输入: 阶段1的事实JSON + 平台特定System Prompt
  并发调用:
    ├── WE_CHAT_WRITER_PROMPT    → 公众号正式长文
    ├── ZHI_HU_WRITER_PROMPT     → 知乎深度文章
    ├── BILIBILI_WRITER_PROMPT   → B站活泼专栏
    ├── XHS_WRITER_PROMPT        → 小红书种草文案（爆款公式）
    └── DOUYIN_WRITER_PROMPT     → 抖音视频脚本描述
  输出: 各平台适配文案
```

### 平台专属 Prompt 设计原则

- **公众号**：正式、专业、逻辑严密、段落结构清晰
- **知乎**：深度、有观点、适合讨论、可带LaTeX
- **B站**：活泼、网感强、适合年轻受众
- **小红书**：爆款公式（痛点前置 + 解决方案 + Emoji + 话题标签）
- **抖音**：钩子开头 + 节奏快 + #话题 + @互动

---

## 三、共享类型设计（修正版）

```typescript
// 媒体资产作为一等公民
interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  dataUrl: string;       // base64 for preview/processing
  fileName: string;
  fileSize: number;      // bytes
  width?: number;
  height?: number;
}

// 规范内容模型
interface CanonicalContent {
  title: string;
  body: string;           // GFM Markdown
  mediaAssets: MediaAsset[];  // 上传的图片/视频
  coverIndex: number;     // 指定第几张为封面(-1表示不指定)
  tags: string[];
}

// 平台特定输出
interface PlatformContent {
  platform: Platform;
  title: string;
  body: string;
  mediaAssets: MediaAsset[];  // 可能经过裁剪/转码
  metadata: {
    videoPlaceholders?: string[];  // 视频占位提示
    truncatedFrom?: number;        // 原文被截断的原始字数
    injectedTags?: string[];       // AI注入的话题标签
  };
}
```

---

## 四、双基类架构（修正版）

```
IPlatformAdapter (接口)
    ↑
BaseAdapter (长文流)
  - markdownToHtml() 共用管道
  - 处理视频占位卡片
    ├── WechatAdapter
    ├── ZhihuAdapter
    └── BilibiliAdapter
    
BaseShortFormAdapter (短文流)
  - markdownToPlainText() 共用管道
  - 字数截断 + hashtag注入
  - 图片排序(封面优先)
    ├── XiaohongshuAdapter
    └── DouyinAdapter
```

---

## 五、未来真实发布演进方案（风控设计）

### 长文流：OAuth2 开放平台
- 公众号：微信公众平台 OAuth2 → access_token → 草稿箱API → 群发API
- 知乎：知乎开放平台 OAuth2 → 文章发布API
- B站：B站开放平台 OAuth2 → 专栏发布API

### 短文流：浏览器自动化
- 小红书/抖音无官方发布API，且风控极严
- 方案：Chrome Extension 注入 Cookie → Puppeteer/Playwright 模拟真实浏览器点击 → 填写表单 → 发布
- 原理：在用户自己的浏览器中执行，携带用户的登录态，规避服务端IP风控

---

## 六、技术栈（不变）

| 层 | 选型 |
|---|---|
| 包管理 | pnpm workspaces |
| 前端 | React 19 + TypeScript + Vite 6 |
| 编辑器 | @uiw/react-md-editor |
| CSS | Tailwind CSS 4 |
| 后端 | Express 5 + TypeScript |
| Markdown | unified/remark/rehype |
| AI | Claude API (Anthropic SDK) |
| 测试 | Vitest |
| Lint | Biome |

---

## 七、PR拆分计划（8个PR，主题聚焦）

| PR | 主题 | 关键产出 | 依赖 |
|---|---|---|---|
| **PR1** | **项目基石** | monorepo脚手架、共享类型(CanonicalContent含MediaAsset、Platform 5个、IPlatformAdapter)、CLAUDE.md、docs/、dev-logs/模板、.env.example、Biome配置、.vscode推荐插件 | - |
| **PR2** | **内容编辑器** | Markdown编辑器(@uiw/react-md-editor)、标题输入、标签输入(预留per-platform编辑结构)、媒体列表占位、EditorContext | PR1 |
| **PR3** | **AI文案生成** | 后端多阶段服务(阶段1事实提取+阶段2五个平台专属Writer Prompt并发)、前端生成面板(双向入口+Accordion折叠+Step进度条+填入编辑器)、API Key缺失友好引导 | PR1 |
| **PR4** | **长文流适配器** | BaseAdapter(unified管道markdown→HTML)、公众号适配器(微信CSS)、知乎适配器(H1→H2+LaTeX保留)、B站适配器(BV号占位卡片) | PR1 |
| **PR5** | **短文流适配器** | BaseShortFormAdapter(纯文本转换+grapheme截断+语法清理)、小红书适配器(1000字+hashtag+封面校验)、抖音适配器(500字+话题标签+视频缺失ValidationError) | PR1, PR4 |
| **PR6** | **媒体上传+AI视觉** | MediaUpload组件(拖拽上传+压缩至1080px+质量提示)、AI Vision增强(图片→事实提取+视频帧提取) | PR2, PR3 |
| **PR7** | **平台预览面板** | PlatformSelector(5平台Tab)、PreviewFrame(iframe沙箱+Shadow DOM隔离+ResizeObserver动态高度+viewport适配)、per-platform标签可视化 | PR4, PR5 |
| **PR8** | **发布系统+文档** | POST /api/publish(模拟发布+延迟+per-platform状态)、PublishPanel(校验摘要+发布结果)、README+架构文档+风控演进方案 | PR7 |

---

## 八、执行策略

1. 严格按PR顺序，一个完成再开始下一个
2. 每个PR完成后立即commit
3. 主分支始终保持可运行（build + test通过）
4. 每日结束前更新 dev-logs/（模板：今日完成/遇到的问题/技术决策/明日计划，禁止空话）
5. 设计决策记录在 docs/
6. 每个涉及UI的PR需在Chrome/iPad尺寸下验证无滚动条死锁、样式溢出
7. 所有用户可见的等待状态必须有进度指示器，禁止纯静态Loading（含风控演进方案）

## 九、验证里程碑

- **PR3完成**：粘贴Markdown长文 → AI生成5个平台版本 → Accordion折叠查看（核心闭环）
- **PR5完成**：5个平台适配器全部可用，convert/preview/validate正确
- **PR6完成**：上传图片 → 自动压缩 → AI识图 → 生成文案（视觉闭环）
- **PR8完成**：全链路：上传图/贴文 → AI生成 → 选平台 → 预览 → 模拟发布

---

## 十、风险与应对检查清单（PM/架构/安全/QA 四维评审）

> 以下问题不在PR中单独建任务，而是作为实现时每次coding必须考虑的基线。
> 解决方案编码到 catch块、中间件、docs/文档中。

### PM维度（产品体验）

| # | 风险 | 应对 | 落地点 |
|---|---|---|---|
| P1 | 文案"矩阵化痕迹"触发平台降权 | AI Prompt注入"去模板化"指令，每平台独立语调 | PR3 ai-generator.ts |
| P2 | 图片base64丢失Exif元数据 | 上传时保留原始文件，发布时使用原文件非base64 | PR6 MediaUpload |
| P3 | 长文转短文"废话文学" | 阶段2 Prompt要求"保留核心结论+数据"，标注置信度 | PR3 stage2 prompts |
| P4 | "如图1所示"图文错位 | 适配器removeCrossReference()清洗交叉引用短语 | PR5 ShortForm adapters |
| P5 | 抖音适配器"卡死"（无视频） | 无视频时适配器返回ValidationError+明确指引，不静默失败 | PR5 douyin.adapter.ts |

### 架构维度（系统可靠性）

| # | 风险 | 应对 | 落地点 |
|---|---|---|---|
| A1 | Base64 30MB+ Payload内存暴动 | 前端压缩至1080px+JPEG quality 80%；后端express.json({limit:'10mb'})限制 | PR6前端压缩, PR3后端limit |
| A2 | 25路并发429 Rate Limit雪崩 | AI调用串行化+指数退避重试(1s/2s/4s)，队列最大并发=3 | PR3 ai-generator.ts |
| A3 | 发布"假成功"（部分平台失败） | 发布日志持久化写入dev-logs/，per-platform状态独立记录 | PR8 publisher.ts |
| A4 | Node.js单线程被CPU任务阻塞 | unified处理移至Worker Thread或限制单次处理≤5000字 | PR4 BaseAdapter |
| A5 | Extension/后端跨进程状态孤岛 | 设计postMessage协议+服务端WebSocket日志回传通道 | docs/architecture.md |

### 安全维度（防攻击+合规）

| # | 风险 | 应对 | 落地点 |
|---|---|---|---|
| S1 | POST /api/generate 被薅羊毛 | API Key仅存服务端.env；简单Token鉴权；IP级频控(express-rate-limit) | PR3 routes/generate.ts |
| S2 | Extension Cookie明文劫持 | 文档声明：未来使用Chrome Storage API加密存储，不落盘 | docs/architecture.md |
| S3 | iframe预览XSS注入 | preview()输出经DOMPurify清洗后再入iframe；iframe sandbox属性严格 | PR7 PreviewFrame.tsx |
| S4 | Puppeteer被检测为机器人 | 文档声明：使用puppeteer-extra+stealth插件+非无头模式可选 | docs/architecture.md |
| S5 | 敏感词连带法律责任 | AI生成内容经敏感词过滤中间件；所有输入/输出写入审计日志 | PR3 middleware |

### QA维度（边界测试）

| # | 风险 | 应对 | 落地点 |
|---|---|---|---|
| Q1 | AI输出非合法JSON(1-5%概率) | JSON.parse包裹try-catch+正则修复常见断裂(补括号/去尾逗号)+重试1次 | PR3 ai-generator.ts |
| Q2 | substring截断破坏Markdown语法/Emoji | 使用Intl.Segmenter做grapheme-aware截断，截断后正则清理未闭合语法 | PR5 BaseShortFormAdapter |
| Q3 | LaTeX/代码块→纯文本变乱码 | markdownToPlainText管道：removeLatex()+collapseCodeToText()+normalizeWhitespace() | PR5 BaseShortFormAdapter |
| Q4 | 0字节/1GB/.exe改.jpg恶意文件 | 前端File.type校验+size上限50MB；后端file-type包二次MIME检测魔数 | PR6前后端双校验 |
| Q5 | iframe响应式断崖(手机/4K) | preview注入viewport meta+max-width容器+overflow处理；多分辨率截图验证 | PR7 PreviewFrame.tsx |

### UX维度（创作者体验）

| # | 风险 | 应对 | 落地点 |
|---|---|---|---|
| U1 | 编辑器预览 vs 平台预览"排版跳动" | 平台Tab切换时保留编辑器预览为基准视图；平台预览区顶部加提示条："以下为平台实际渲染效果，可能与编辑预览有差异" | PR7 PreviewPanel |
| U2 | 统一标签框→各平台标签格式割裂 | 标签改为per-platform可编辑；每个平台Tab下展示该平台标签渲染后的视觉样式 | PR2 EditorPanel, PR7 PlatformSelector |
| U3 | 5平台文案同屏"信息过载" | Accordion折叠面板+Tab切换，默认只展开第一个平台；加"只看差异"高亮模式 | PR3 AIGeneratePanel |
| U4 | 图片压缩"黑盒"→画质焦虑 | 压缩后在缩略图角上显示"已优化"小标签+Hover气泡："为提升分发速度，已自动优化至1080px/80%质量，原文件保留" | PR6 MediaUpload |

### DX维度（开发者体验）

| # | 风险 | 应对 | 落地点 |
|---|---|---|---|
| D1 | iframe"双滚动条地狱" | iframe内注入脚本：监听内容高度变化→postMessage→外层用ResizeObserver动态设iframe高度；禁止iframe内body overflow | PR7 PreviewFrame.tsx |
| D2 | Tailwind Preflight穿透污染iframe | iframe srcdoc自带reset CSS且不使用Tailwind CDN；Shadow DOM包裹隔离（备选方案） | PR7 PreviewFrame.tsx |
| D3 | 缺API Key→500崩溃无引导 | 后端启动时检测env，缺失则console.warn引导信息不崩溃；/api/generate返回400+友好JSON | PR3 index.ts, routes/generate.ts |
| D4 | AI串行排队→"视觉假死" | 前端轮询/generate/status获取进度；UI展示Step进度条；非简单spinner | PR3 AIGeneratePanel |
| D5 | Biome本地配置不一致→CI红叉 | package.json scripts加入format:fix；docs中加入VS Code推荐插件列表(.vscode/extensions.json)；CI仅warning不block | PR1 biome.json, .vscode/ |
| D6 | dev-logs/自动垃圾→信息噪音 | 日志模板固定为4段：今日完成/遇到的问题/技术决策/明日计划；禁止"继续开发"类空话 | PR1 dev-logs模板 |

---

## 附录：答辩核心话术

> "我们发现市面上的分发工具只是机械的复制粘贴。而我们的产品核心卖点是**内容流的降维与升维**。长文流利用unified生态保证排版和代码块完美复现；短文流利用大模型进行语义级别的'浓缩和语调重塑'，让同一套素材在微信像论文、在小红书像种草、在抖音像脚本。针对风控问题，我们设计了OAuth2+Browser Extension的双轨发布架构，在创作者自己的浏览器中完成敏感平台的内容分发，规避了服务端IP被平台封禁的风险。"
