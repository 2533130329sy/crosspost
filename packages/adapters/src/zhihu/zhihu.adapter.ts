import type { CanonicalContent, PlatformContent } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';
import { BaseAdapter } from '../base/BaseAdapter';
import { ZHIHU_CONSTRAINTS, ZHIHU_PREVIEW_CSS } from './zhihu.constants';

export class ZhihuAdapter extends BaseAdapter {
  readonly platform = Platform.ZHIHU;
  readonly displayName = '知乎';
  readonly constraints = ZHIHU_CONSTRAINTS;

  async convert(content: CanonicalContent): Promise<PlatformContent> {
    // Shift headings: H1 → H2, H2 → H3, etc. (Zhihu uses H1 for question title)
    const body = content.body.replace(/^(#+)/gm, (hashes) => hashes + '#');

    return {
      platform: this.platform,
      title: content.title,
      body,
      mediaAssets: content.mediaAssets,
      metadata: {},
    };
  }

  async preview(content: CanonicalContent): Promise<string> {
    const shiftedBody = content.body.replace(/^(#+)/gm, (hashes) => hashes + '#');

    const html = await this.markdownToHtml(shiftedBody);

    return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">${ZHIHU_PREVIEW_CSS}</head>
<body><div class="zhihu-preview">
  <h2>${this.escapeHtml(content.title)}</h2>
  ${html}
</div></body></html>`;
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
