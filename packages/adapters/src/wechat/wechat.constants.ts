import type { PlatformConstraints } from '@crosspost/shared';

export const WECHAT_CONSTRAINTS: PlatformConstraints = {
  maxTitleLength: 64,
  maxBodyLength: 20000,
  minImages: 0,
  maxImages: 20,
  outputFormat: 'html',
  supportsCodeBlock: true,
  supportsLatex: false,
  supportsVideoEmbed: true,
  supportsTags: false,
};

export const WECHAT_PREVIEW_CSS = `
<style>
  .wechat-preview {
    max-width: 677px;
    margin: 0 auto;
    padding: 20px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 17px;
    line-height: 1.8;
    color: #333;
    background: #fff;
  }
  .wechat-preview h1 { font-size: 22px; font-weight: 700; margin: 20px 0 10px; }
  .wechat-preview h2 { font-size: 20px; font-weight: 600; margin: 18px 0 8px; }
  .wechat-preview h3 { font-size: 18px; font-weight: 600; margin: 16px 0 6px; }
  .wechat-preview p { margin: 10px 0; }
  .wechat-preview img { max-width: 100%; height: auto; border-radius: 4px; }
  .wechat-preview pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 14px; }
  .wechat-preview code { font-family: "SF Mono", Monaco, Consolas, monospace; font-size: 14px; }
  .wechat-preview blockquote { border-left: 3px solid #ddd; padding-left: 12px; color: #666; margin: 10px 0; }
  .wechat-preview table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  .wechat-preview th, .wechat-preview td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  .wechat-preview .video-placeholder {
    background: #f0f7ff; border: 2px dashed #93c5fd; border-radius: 8px;
    padding: 24px; text-align: center; color: #6b7280; margin: 16px 0; font-size: 14px;
  }
</style>`;
