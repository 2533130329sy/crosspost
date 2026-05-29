import type { PlatformConstraints } from '@crosspost/shared';

export const DOUYIN_CONSTRAINTS: PlatformConstraints = {
  maxTitleLength: 55,
  maxBodyLength: 500,
  minImages: 0,
  maxImages: 9,
  outputFormat: 'plaintext',
  supportsCodeBlock: false,
  supportsLatex: false,
  supportsVideoEmbed: true,
  supportsTags: true,
};

export const DOUYIN_PREVIEW_CSS = `
<style>
  .douyin-preview {
    max-width: 375px;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif;
    background: #000;
    color: #fff;
  }
  .douyin-phone {
    padding: 12px; min-height: 600px;
    display: flex; flex-direction: column; justify-content: flex-end;
  }
  .douyin-video-area {
    flex: 1; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; margin-bottom: 12px;
    position: relative;
  }
  .douyin-video-placeholder {
    width: 100%; aspect-ratio: 9/16;
    background: linear-gradient(180deg, #1a1a2e, #16213e);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 14px; border-radius: 8px;
    text-align: center; flex-direction: column; gap: 8px;
  }
  .douyin-info { padding: 0 4px; }
  .douyin-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; line-height: 1.4; }
  .douyin-body { font-size: 13px; color: #ccc; line-height: 1.5; white-space: pre-wrap; margin-bottom: 8px; }
  .douyin-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .douyin-tag { color: #fff; font-size: 12px; background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 4px; }
  .douyin-meta { display: flex; gap: 12px; color: #999; font-size: 12px; }
</style>`;
