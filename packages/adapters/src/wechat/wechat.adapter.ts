import type { CanonicalContent, PlatformContent } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';
import { BaseAdapter } from '../base/BaseAdapter';
import { WECHAT_CONSTRAINTS, WECHAT_PREVIEW_CSS } from './wechat.constants';

export class WechatAdapter extends BaseAdapter {
  readonly platform = Platform.WECHAT;
  readonly displayName = '微信公众号';
  readonly constraints = WECHAT_CONSTRAINTS;

  async convert(content: CanonicalContent): Promise<PlatformContent> {
    const html = await this.markdownToHtml(content.body);

    return {
      platform: this.platform,
      title: content.title,
      body: `<section class="rich_media_content">${html}</section>`,
      mediaAssets: content.mediaAssets,
      metadata: {},
    };
  }

  async preview(content: CanonicalContent): Promise<string> {
    const html = await this.markdownToHtml(content.body);
    const videoPlaceholders = this.detectVideoPlaceholders(content.body);

    let videoHtml = '';
    if (videoPlaceholders.length > 0) {
      videoHtml = videoPlaceholders
        .map(
          (v) =>
            `<div class="video-placeholder">[此处请在发布时手动插入您在当前平台上传的视频: ${v}]</div>`,
        )
        .join('');
    }

    return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">${WECHAT_PREVIEW_CSS}</head>
<body><div class="wechat-preview">
  <h1>${this.escapeHtml(content.title)}</h1>
  ${videoHtml}
  <div class="rich_media_content">${html}</div>
</div></body></html>`;
  }

  private detectVideoPlaceholders(md: string): string[] {
    const matches = md.match(/!\[.*?\]\((.*?\.(?:mp4|mov|avi|webm).*?)\)/gi);
    return matches ? matches.map((m) => m.replace(/!\[(.*?)\].*/, '$1')) : [];
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
