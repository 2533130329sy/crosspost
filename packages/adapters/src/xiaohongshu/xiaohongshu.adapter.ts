import type { CanonicalContent, PlatformContent } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';
import { BaseShortFormAdapter } from '../base/BaseShortFormAdapter';
import { XIAOHONGSHU_CONSTRAINTS, XIAOHONGSHU_PREVIEW_CSS } from './xiaohongshu.constants';

export class XiaohongshuAdapter extends BaseShortFormAdapter {
  readonly platform = Platform.XIAOHONGSHU;
  readonly displayName = '小红书';
  readonly constraints = XIAOHONGSHU_CONSTRAINTS;

  async convert(content: CanonicalContent): Promise<PlatformContent> {
    let text = this.markdownToPlainText(content.body);
    const tags = this.extractTags(text);

    // Truncate to 1000 chars
    const { text: truncatedBody, truncated } = this.truncate(text, 1000);

    // Truncate title to 20 chars
    const { text: truncatedTitle } = this.truncate(content.title, 20);

    // Append hashtag line if not already present
    let body = truncatedBody;
    if (tags.length > 0) {
      const tagLine = tags.map((t) => `#${t}`).join(' ');
      if (!body.includes(tagLine)) {
        body = body + '\n\n' + tagLine;
      }
    }

    return {
      platform: this.platform,
      title: truncatedTitle,
      body,
      mediaAssets: content.mediaAssets,
      metadata: {
        truncatedFrom: truncated ? this.graphemeLength(text) : undefined,
        injectedTags: tags,
      },
    };
  }

  async preview(content: CanonicalContent): Promise<string> {
    const { text: truncatedTitle } = this.truncate(content.title, 20);
    let text = this.markdownToPlainText(content.body);
    const { text: body } = this.truncate(text, 1000);

    const tags = this.extractTags(text) || this.extractTags(body);
    const tagHtml = tags
      .slice(0, 6)
      .map((t) => `<span class="xhs-tag">#${t}</span>`)
      .join('');

    const hasCover = content.mediaAssets.length > 0;
    const coverHtml = hasCover
      ? `<img src="${content.mediaAssets[content.coverIndex >= 0 ? content.coverIndex : 0].dataUrl}" style="width:100%;height:100%;object-fit:cover" alt="cover" />`
      : '<div class="xhs-cover">需要至少1张封面图</div>';

    return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">${XIAOHONGSHU_PREVIEW_CSS}</head>
<body><div class="xhs-preview">
  <div class="xhs-card">
    <div class="xhs-cover">${coverHtml}</div>
    <div class="xhs-body">
      <div class="xhs-title">${this.escapeHtml(truncatedTitle)}</div>
      <div class="xhs-text">${this.escapeHtml(body)}</div>
      ${tagHtml ? `<div class="xhs-tags">${tagHtml}</div>` : ''}
    </div>
    <div class="xhs-stats">
      <span>&#10084; 点赞</span><span>&#9733; 收藏</span><span>&#9998; 评论</span>
    </div>
  </div>
</div></body></html>`;
  }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
