import type { PlatformConstraints } from '@crosspost/shared';

export const BILIBILI_CONSTRAINTS: PlatformConstraints = {
  maxTitleLength: 100,
  maxBodyLength: 20000,
  minImages: 0,
  maxImages: 30,
  outputFormat: 'html',
  supportsCodeBlock: true,
  supportsLatex: false,
  supportsVideoEmbed: true,
  supportsTags: false,
};

export const BILIBILI_PREVIEW_CSS = `
<style>
  .bilibili-preview {
    max-width: 740px;
    margin: 0 auto;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 15px;
    line-height: 1.8;
    color: #222;
    background: #fff;
  }
  .bilibili-preview h1 { font-size: 24px; font-weight: 700; margin: 20px 0 12px; }
  .bilibili-preview h2 { font-size: 20px; font-weight: 600; margin: 18px 0 10px; padding-left: 10px; border-left: 3px solid #fb7299; }
  .bilibili-preview h3 { font-size: 17px; font-weight: 600; margin: 16px 0 8px; }
  .bilibili-preview p { margin: 10px 0; }
  .bilibili-preview img { max-width: 100%; height: auto; border-radius: 8px; }
  .bilibili-preview figure { margin: 16px 0; text-align: center; }
  .bilibili-preview figcaption { font-size: 13px; color: #999; margin-top: 6px; }
  .bilibili-preview pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; }
  .bilibili-preview code { font-family: "SF Mono", Monaco, Consolas, monospace; }
  .bilibili-preview blockquote { border-left: 3px solid #fb7299; padding-left: 12px; color: #666; margin: 10px 0; background: #fdf2f5; padding: 10px 14px; border-radius: 0 6px 6px 0; }
  .bilibili-preview .bv-card {
    background: #fdf2f5; border: 2px solid #fb7299; border-radius: 10px;
    padding: 16px; text-align: center; margin: 16px 0;
    font-size: 14px; color: #fb7299; font-weight: 500;
  }
  .bilibili-preview .video-placeholder {
    background: #fff7ed; border: 2px dashed #fdba74; border-radius: 8px;
    padding: 20px; text-align: center; color: #9a3412; margin: 16px 0; font-size: 14px;
  }
</style>`;
