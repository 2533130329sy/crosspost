# CrossPost 设计规范

## 用户界面原则

1. 所有等待状态必须有进度指示器（禁止纯静态 spinner）
2. 平台预览区与编辑器预览之间需提示排版差异
3. AI 生成结果使用 Accordion 折叠面板，避免信息过载
4. 图片压缩后需显示"已优化"提示
5. iframe 预览需动态高度适配，避免双滚动条

## 组件设计

- EditorPanel: 左侧编辑区，Markdown 输入 + 标题 + 标签
- AIGeneratePanel: AI 生成按钮 + Step 进度条 + Accordion 结果
- PlatformSelector: 顶部 Tab 栏，5 平台切换
- PreviewPanel: 右侧预览区，iframe 沙箱隔离
- MediaUpload: 拖拽上传、压缩、预览
- PublishPanel: 校验摘要 + 发布按钮 + 结果

## 响应式

- Chrome/iPad 尺寸验证无滚动条死锁
- iframe 注入 viewport meta
