import { describe, expect, it } from 'vitest';
import { WechatAdapter } from '../wechat/wechat.adapter';
import { ZhihuAdapter } from '../zhihu/zhihu.adapter';
import { BilibiliAdapter } from '../bilibili/bilibili.adapter';
import type { CanonicalContent } from '@crosspost/shared';

const sampleContent: CanonicalContent = {
  title: '测试文章标题',
  body: `## 第一章

这是一段测试正文，包含**加粗**和*斜体*。

\`\`\`javascript
console.log("Hello CrossPost");
\`\`\`

- 列表项1
- 列表项2

> 引用文字

[链接文字](https://example.com)`,
  mediaAssets: [],
  coverIndex: -1,
  tags: ['测试', '技术'],
};

describe('WechatAdapter', () => {
  const adapter = new WechatAdapter();

  it('should have correct platform', () => {
    expect(adapter.platform).toBe('wechat');
  });

  it('should validate title length', () => {
    const longTitle = 'x'.repeat(65);
    const errors = adapter.validate({ ...sampleContent, title: longTitle });
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('TOO_LONG');
  });

  it('should convert markdown to HTML', async () => {
    const result = await adapter.convert(sampleContent);
    expect(result.platform).toBe('wechat');
    expect(result.body).toContain('<h2>');
    expect(result.body).toContain('rich_media_content');
  });

  it('should generate preview HTML', async () => {
    const preview = await adapter.preview(sampleContent);
    expect(preview).toContain('<!DOCTYPE html>');
    expect(preview).toContain('wechat-preview');
    expect(preview).toContain('测试文章标题');
  });
});

describe('ZhihuAdapter', () => {
  const adapter = new ZhihuAdapter();

  it('should shift H1 to H2', async () => {
    const content = { ...sampleContent, body: '# 一级标题\n## 二级标题' };
    const result = await adapter.convert(content);
    expect(result.body).toContain('## 一级标题');
    expect(result.body).toContain('### 二级标题');
  });

  it('should preserve LaTeX blocks', async () => {
    const content = { ...sampleContent, body: '$$\n\\sum_{i=1}^n x_i\n$$' };
    const result = await adapter.convert(content);
    expect(result.body).toContain('$$');
    expect(result.body).toContain('\\sum');
  });

  it('should generate preview HTML', async () => {
    const preview = await adapter.preview(sampleContent);
    expect(preview).toContain('<!DOCTYPE html>');
    expect(preview).toContain('zhihu-preview');
    expect(preview).toContain('<h2>'); // title rendered as h2
  });
});

describe('BilibiliAdapter', () => {
  const adapter = new BilibiliAdapter();

  it('should detect BV numbers', async () => {
    const content = { ...sampleContent, body: '视频 BV1xx411c7mD 介绍' };
    const result = await adapter.convert(content);
    expect(result.body).toContain('bv-card');
    expect(result.body).toContain('BV1xx411c7mD');
  });

  it('should generate preview with B站 pink theme', async () => {
    const preview = await adapter.preview(sampleContent);
    expect(preview).toContain('<!DOCTYPE html>');
    expect(preview).toContain('bilibili-preview');
    expect(preview).toContain('#fb7299');
  });

  it('should handle video placeholders', async () => {
    const content = { ...sampleContent, body: '![video](demo.mp4)' };
    const preview = await adapter.preview(content);
    expect(preview).toContain('video-placeholder');
  });
});
