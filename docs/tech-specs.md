# CrossPost 技术规范

## 技术栈

| 层 | 选型 | 版本 |
|---|---|---|
| 包管理 | pnpm workspaces | 10+ |
| 前端框架 | React | 19 |
| 构建工具 | Vite | 6 |
| CSS | Tailwind CSS | 4 |
| Markdown编辑器 | @uiw/react-md-editor | latest |
| 后端 | Express | 5 |
| Markdown处理 | unified/remark/rehype | latest |
| AI | Anthropic SDK (Claude API) | latest |
| 测试 | Vitest | 3 |
| Lint/Format | Biome | 1.9+ |
| 运行时 | Node.js | 18+ |

## 代码规范

- TypeScript strict mode
- ESM模块
- Biome 格式化：单引号、分号、尾逗号
- 2空格缩进

## API 规范

- Content-Type: application/json
- 错误响应: { error: string, code: string }
- AI生成请求体限制: 10MB
