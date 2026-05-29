import type { CanonicalContent, PlatformContent } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';
import { BaseAdapter } from '../base/BaseAdapter';
import { BILIBILI_CONSTRAINTS, BILIBILI_PREVIEW_CSS } from './bilibili.constants';

export class BilibiliAdapter extends BaseAdapter {
  readonly platform = Platform.BILIBILI;
  readonly displayName = 'B站';
  readonly constraints = BILIBILI_CONSTRAINTS;

  async convert(content: CanonicalContent): Promise<PlatformContent> {
    const html = await this.markdownToHtml(this.replaceBVCards(content.body));

    return {
      platform: this.platform,
      title: content.title,
      body: html,
      mediaAssets: content.mediaAssets,
      metadata: {},
    };
  }

  async preview(content: CanonicalContent): Promise<string> {
    const bodyWithBV = this.replaceBVCards(content.body);
    const html = await this.markdownToHtml(bodyWithBV);

    const videoPlaceholders = this.detectVideos(content.body);
    let videoHtml = '';
    if (videoPlaceholders.length > 0) {
      videoHtml = videoPlaceholders
        .map(
          () =>
            '<div class="video-placeholder">[此处请在发布时手动插入您在当前平台上传的视频]</div>',
        )
        .join('');
    }

    return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">${BILIBILI_PREVIEW_CSS}</head>
<body><div class="bilibili-preview">
  <h1>${this.escapeHtml(content.title)}</h1>
  ${videoHtml}
  ${html}
</div></body></html>`;
  }

  /** Replace BV number references in text with styled cards */
  private replaceBVCards(md: string): string {
    return md.replace(/BV[a-zA-Z0-9]{10}/g, (bv) => {
      return `<div class="bv-card">[B站视频卡片: ${bv}] — 请在发布时替换为实际视频嵌入</div>`;
    });
  }

  private detectVideos(md: string): string[] {
    const matches = md.match(/!\[.*?\]\((.*?\.(?:mp4|mov|avi|webm).*?)\)/gi);
    return matches || [];
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
