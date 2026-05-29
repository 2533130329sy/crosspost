import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from '@crosspost/shared';
import type { CanonicalContent } from '@crosspost/shared';
import { getAdapter } from '@crosspost/adapters';
import { useEditor } from '../../context/EditorContext';
import { PreviewFrame } from './PreviewFrame';

function wrapPreviewHtml(body: string, imageUrls: string[]): string {
  const imagesHtml = imageUrls
    .map((url, i) => `<img src="${url}" alt="图片${i + 1}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`)
    .join('');

  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8">
<style>body{font-family:system-ui,sans-serif;padding:16px;line-height:1.6;margin:0}</style></head>
<body>${imagesHtml}${body}</body></html>`;
}

export function PreviewPanel() {
  const { activePlatform, platformBodies, mediaAssets, aiPlatformHints } = useEditor();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const current = platformBodies[activePlatform];

  const content: CanonicalContent = useMemo(
    () => ({
      title: current?.title || '未命名',
      body: current?.body || '',
      mediaAssets,
      coverIndex: mediaAssets.length > 0 ? 0 : -1,
      tags: [],
    }),
    [current, mediaAssets],
  );

  const generatePreview = useCallback(async () => {
    const imageUrls = mediaAssets.filter((a) => a.type === 'image').map((a) => a.dataUrl);

    // If AI hints exist for this platform, use them directly
    if (aiPlatformHints?.[activePlatform]) {
      const hint = aiPlatformHints[activePlatform];
      setPreviewHtml(wrapPreviewHtml(hint.body, imageUrls));
      return;
    }

    if (!content.body.trim()) {
      setPreviewHtml(null);
      return;
    }

    setLoading(true);
    try {
      const adapter = getAdapter(activePlatform);
      const html = await adapter.preview(content);
      setPreviewHtml(html);
      setError(null);
    } catch (err) {
      console.error(`[PreviewPanel] preview failed:`, err);
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setLoading(false);
    }
  }, [activePlatform, content, aiPlatformHints, mediaAssets]);

  useEffect(() => {
    const timer = setTimeout(generatePreview, 300);
    return () => clearTimeout(timer);
  }, [generatePreview]);

  return (
    <div style={{ borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          border: 'none',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <span>{collapsed ? '&#9654;' : '&#9660;'}</span>
        平台预览
        {loading && <span style={{ color: '#9ca3af', fontSize: 11 }}>刷新中...</span>}
        {error && <span style={{ color: '#ef4444', fontSize: 11 }}>预览失败</span>}
      </button>

      {!collapsed && (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {loading && !previewHtml ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              正在生成预览...
            </div>
          ) : error ? (
            <div style={{ padding: 16, color: '#dc2626', fontSize: 13 }}>{error}</div>
          ) : previewHtml ? (
            <div style={{ padding: '0 8px 8px' }}>
              <PreviewFrame html={previewHtml} platform="" />
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: '#c0c0c0', fontSize: 13 }}>
              在编辑器中输入内容后自动生成预览
            </div>
          )}
        </div>
      )}
    </div>
  );
}
