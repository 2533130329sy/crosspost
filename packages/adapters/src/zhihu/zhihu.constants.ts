import type { PlatformConstraints } from '@crosspost/shared';

export const ZHIHU_CONSTRAINTS: PlatformConstraints = {
  maxTitleLength: 100,
  maxBodyLength: 50000,
  minImages: 0,
  maxImages: 50,
  outputFormat: 'markdown',
  supportsCodeBlock: true,
  supportsLatex: true,
  supportsVideoEmbed: false,
  supportsTags: false,
};

export const ZHIHU_PREVIEW_CSS = `
<style>
  .zhihu-preview {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.75;
    color: #1a1a1a;
    background: #fff;
  }
  .zhihu-preview h2 { font-size: 20px; font-weight: 700; margin: 24px 0 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  .zhihu-preview h3 { font-size: 18px; font-weight: 600; margin: 20px 0 10px; }
  .zhihu-preview p { margin: 12px 0; }
  .zhihu-preview img { max-width: 100%; height: auto; border-radius: 4px; }
  .zhihu-preview pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; font-size: 14px; }
  .zhihu-preview code { font-family: "SF Mono", Monaco, Consolas, monospace; font-size: 14px; background: #f0f0f0; padding: 2px 6px; border-radius: 3px; }
  .zhihu-preview blockquote { border-left: 3px solid #0066cc; padding-left: 14px; color: #555; margin: 12px 0; }
  .zhihu-preview .katex { font-size: 1.1em; }
</style>`;
