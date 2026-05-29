# CrossPost 执行步骤

## PR 交付节奏

| PR | 主题 | 里程碑 |
|---|---|---|
| PR1 | 项目基石 | pnpm build 全量通过 |
| PR2 | 内容编辑器 | Markdown 编辑器可输入 |
| PR3 | AI 文案生成 | 粘贴长文 → AI 生成 5 平台版本 |
| PR4 | 长文流适配器 | 公众号/知乎/B站 convert+preview |
| PR5 | 短文流适配器 | 小红书/抖音 convert+preview |
| PR6 | 媒体上传+AI视觉 | 上传图片 → AI 识图 → 生成文案 |
| PR7 | 平台预览面板 | 5 平台 Tab + iframe 预览 |
| PR8 | 发布系统+文档 | 全链路可演示 |

## 开发规范

- 每 PR 完成后立即 commit
- 主分支始终保持可运行
- 每日更新 dev-logs/
- 每个 UI 相关 PR 需在 Chrome/iPad 尺寸验证
