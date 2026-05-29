import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from '@crosspost/shared';
import type { CanonicalContent } from '@crosspost/shared';
import { getAdapter } from '@crosspost/adapters';
import { useEditor } from '../../context/EditorContext';
import { PlatformSelector } from '../PlatformSelector/PlatformSelector';
import { PreviewFrame } from './PreviewFrame';

const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.WECHAT]: '公众号',
  [Platform.ZHIHU]: '知乎',
  [Platform.BILIBILI]: 'B站',
  [Platform.XIAOHONGSHU]: '小红书',
  [Platform.DOUYIN]: '抖音',
};

export function PreviewPanel() {
  const { title, body, tags, mediaAssets } = useEditor();
  const [activePlatform, setActivePlatform] = useState<Platform>(Platform.WECHAT);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const content: CanonicalContent = useMemo(
    () => ({
      title: title || '未命名',
      body: body || '*（空内容）*',
      mediaAssets,
      coverIndex: mediaAssets.length > 0 ? 0 : -1,
      tags: tags[Platform.WECHAT] ?? [],
    }),
    [title, body, mediaAssets, tags],
  );

  const generatePreviews = useCallback(async () => {
    setLoading(true);
    const newPreviews: Record<string, string> = {};
    const newErrors: Record<string, string> = {};

    if (!content.body.trim()) {
      setLoading(false);
      return;
    }

    const platforms = Object.values(Platform);
    for (const p of platforms) {
      try {
        const adapter = getAdapter(p);
        const html = await adapter.preview(content);
        if (!html || html.length < 50) {
          throw new Error(`Generated preview is empty for ${p}`);
        }
        newPreviews[p] = html;
      } catch (err) {
        console.error(`[PreviewPanel] ${p} preview failed:`, err);
        newErrors[p] = err instanceof Error ? err.message : 'Preview failed';
      }
    }

    setPreviews(newPreviews);
    setErrors(newErrors);
    setLoading(false);
  }, [content]);

  // Auto-generate previews when content changes (immediate on mount, debounced after)
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      generatePreviews();
      return;
    }
    const timer = setTimeout(generatePreviews, 500);
    return () => clearTimeout(timer);
  }, [generatePreviews]);

  const perPlatformTags = tags[activePlatform] ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PlatformSelector active={activePlatform} onSelect={setActivePlatform} />

      {/* Per-platform tags visualization */}
      {perPlatformTags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            padding: '8px 12px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <span style={{ fontSize: 11, color: '#9ca3af', lineHeight: '22px' }}>
            {PLATFORM_LABELS[activePlatform]}标签：
          </span>
          {perPlatformTags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 12,
                background: '#eff6ff',
                color: '#3b82f6',
                padding: '2px 8px',
                borderRadius: 10,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Preview area */}
      {loading && !previews[activePlatform] ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 13,
          }}
        >
          正在生成预览...
        </div>
      ) : errors[activePlatform] ? (
        <div style={{ padding: 16, color: '#dc2626', fontSize: 13 }}>
          预览失败: {errors[activePlatform]}
        </div>
      ) : previews[activePlatform] ? (
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          {/* "排版差异" warning */}
          <div
            style={{
              padding: '6px 12px',
              background: '#fefce8',
              borderBottom: '1px solid #fde68a',
              fontSize: 11,
              color: '#92400e',
            }}
          >
            以下为{PLATFORM_LABELS[activePlatform]}平台实际渲染效果，可能与编辑预览有差异
          </div>
          <PreviewFrame html={previews[activePlatform]} platform={PLATFORM_LABELS[activePlatform]} />
        </div>
      ) : Object.keys(errors).length > 0 ? (
        <div style={{ padding: 16, color: '#dc2626', fontSize: 13 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>所有平台预览失败：</p>
          {Object.entries(errors).map(([p, msg]) => (
            <p key={p} style={{ margin: '4px 0' }}>
              {p}: {msg}
            </p>
          ))}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c0c0c0',
            fontSize: 13,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>&#127912;</p>
            <p>在左侧编辑器中输入内容</p>
            <p style={{ fontSize: 11 }}>自动生成各平台预览</p>
          </div>
        </div>
      )}
    </div>
  );
}
