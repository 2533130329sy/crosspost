import type { CanonicalContent, PlatformContent, ValidationError } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';
import { BaseShortFormAdapter } from '../base/BaseShortFormAdapter';
import { DOUYIN_CONSTRAINTS, DOUYIN_PREVIEW_CSS } from './douyin.constants';

export class DouyinAdapter extends BaseShortFormAdapter {
  readonly platform = Platform.DOUYIN;
  readonly displayName = '抖音';
  readonly constraints = DOUYIN_CONSTRAINTS;

  validate(content: CanonicalContent): ValidationError[] {
    const errors = super.validate(content);

    // Douyin: video is the core asset. Without a video, warn the user.
    const hasVideo = content.mediaAssets.some((m) => m.type === 'video');
    if (!hasVideo) {
      errors.push({
        field: 'mediaAssets',
        code: 'MISSING_VIDEO',
        message:
          '抖音发布需要视频文件。请上传视频素材，或选择其他平台发布。如果暂时没有视频，可以先生成文案后再补充视频。',
      });
    }

    return errors;
  }

  async convert(content: CanonicalContent): Promise<PlatformContent> {
    let text = this.markdownToPlainText(content.body);
    const tags = this.extractTags(text);

    // Truncate to 500 chars
    const { text: truncatedBody, truncated } = this.truncate(text, 500);
    const { text: truncatedTitle } = this.truncate(content.title, 55);

    let body = truncatedBody;
    const tagLine = tags.map((t) => `#${t}`).join(' ');
    if (tagLine && !body.includes(tagLine)) {
      body = body + '\n\n' + tagLine;
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
    const { text: truncatedTitle } = this.truncate(content.title, 55);
    let text = this.markdownToPlainText(content.body);
    const { text: body } = this.truncate(text, 500);

    const tags = this.extractTags(text) || this.extractTags(body);
    const tagHtml = tags
      .slice(0, 5)
      .map((t) => `<span class="douyin-tag">#${t}</span>`)
      .join('');

    const hasVideo = content.mediaAssets.some((m) => m.type === 'video');
    const videoPlaceholder = hasVideo
      ? '<div class="douyin-video-placeholder">视频已就绪<br>点击播放</div>'
      : '<div class="douyin-video-placeholder">需要上传视频文件<br>抖音发布必须包含视频</div>';

    return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">${DOUYIN_PREVIEW_CSS}</head>
<body><div class="douyin-preview">
  <div class="douyin-phone">
    <div class="douyin-video-area">${videoPlaceholder}</div>
    <div class="douyin-info">
      <div class="douyin-title">${this.escapeHtml(truncatedTitle)}</div>
      <div class="douyin-body">${this.escapeHtml(body)}</div>
      ${tagHtml ? `<div class="douyin-tags">${tagHtml}</div>` : ''}
      <div class="douyin-meta">
        <span>&#10084; 点赞</span><span>&#9998; 评论</span><span>&#128229; 分享</span>
      </div>
    </div>
  </div>
</div></body></html>`;
  }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
