import type { PlatformConstraints } from '@crosspost/shared';

export const XIAOHONGSHU_CONSTRAINTS: PlatformConstraints = {
  maxTitleLength: 20,
  maxBodyLength: 1000,
  minImages: 1,
  maxImages: 10,
  outputFormat: 'plaintext',
  supportsCodeBlock: false,
  supportsLatex: false,
  supportsVideoEmbed: false,
  supportsTags: true,
};

export const XIAOHONGSHU_PREVIEW_CSS = `
<style>
  .xhs-preview {
    max-width: 375px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
    background: #fff;
  }
  .xhs-card {
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .xhs-cover {
    width: 100%; aspect-ratio: 3/4;
    background: linear-gradient(135deg, #ff9a9e, #fad0c4);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 14px; font-weight: 600;
  }
  .xhs-body { padding: 12px 16px; }
  .xhs-title {
    font-size: 16px; font-weight: 700; color: #222;
    margin-bottom: 8px; line-height: 1.4;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .xhs-text {
    font-size: 14px; color: #333; line-height: 1.6;
    white-space: pre-wrap; margin-bottom: 10px;
  }
  .xhs-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .xhs-tag {
    color: #ff2442; font-size: 13px;
    background: #fff0f3; padding: 2px 8px; border-radius: 10px;
  }
  .xhs-stats {
    display: flex; gap: 16px; padding: 10px 16px; border-top: 1px solid #f0f0f0;
    color: #999; font-size: 12px;
  }
</style>`;
