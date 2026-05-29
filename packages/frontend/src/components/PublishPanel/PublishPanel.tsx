import { useCallback, useMemo, useState } from 'react';
import { Platform } from '@crosspost/shared';
import type { CanonicalContent } from '@crosspost/shared';
import { getAdapter } from '@crosspost/adapters';
import { useEditor } from '../../context/EditorContext';

const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.WECHAT]: '公众号',
  [Platform.ZHIHU]: '知乎',
  [Platform.BILIBILI]: 'B站',
  [Platform.XIAOHONGSHU]: '小红书',
  [Platform.DOUYIN]: '抖音',
};

const ALL_PLATFORMS = Object.values(Platform);

interface PlatformResult {
  platform: Platform;
  status: 'success' | 'validation_error' | 'publish_error';
  message: string;
  publishedAt?: string;
  mockUrl?: string;
}

export function PublishPanel() {
  const { platformBodies, tags, mediaAssets } = useEditor();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(
    new Set(ALL_PLATFORMS),
  );
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PlatformResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasAnyContent = useMemo(
    () => Object.values(platformBodies).some((c) => c?.body?.trim()),
    [platformBodies],
  );

  // Pre-validate all platforms
  const validationSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    for (const p of ALL_PLATFORMS) {
      const c = platformBodies[p];
      if (!c?.body?.trim()) {
        summary[p] = 1; // No content
        continue;
      }
      try {
        const adapter = getAdapter(p);
        const errors = adapter.validate({
          title: c.title || '未命名',
          body: c.body,
          mediaAssets,
          coverIndex: mediaAssets.length > 0 ? 0 : -1,
          tags: tags[p] ?? [],
        });
        summary[p] = errors.length;
      } catch {
        summary[p] = -1;
      }
    }
    return summary;
  }, [platformBodies, mediaAssets, tags]);

  const togglePlatform = useCallback((p: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }, []);

  const handlePublish = useCallback(async () => {
    if (selectedPlatforms.size === 0) {
      setError('请至少选择一个平台');
      return;
    }

    setPublishing(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: Object.fromEntries(
            Array.from(selectedPlatforms).map((p) => [
              p,
              {
                title: platformBodies[p]?.title || '未命名',
                body: platformBodies[p]?.body || '',
                mediaAssets,
                coverIndex: mediaAssets.length > 0 ? 0 : -1,
                tags: tags[p] ?? [],
              },
            ]),
          ),
          platforms: Array.from(selectedPlatforms),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }

      const { results: publishResults } = (await res.json()) as { results: PlatformResult[] };
      setResults(publishResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  }, [platformBodies, mediaAssets, tags, selectedPlatforms]);

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>一键发布</h3>

      {/* Validation summary */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>发布前校验：</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {ALL_PLATFORMS.map((p) => {
            const errCount = validationSummary[p] ?? 0;
            const status =
              errCount < 0 ? 'error' : errCount > 0 ? 'warning' : 'ok';
            return (
              <div
                key={p}
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background:
                      status === 'ok' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444',
                    flexShrink: 0,
                  }}
                />
                <span style={{ width: 50 }}>{PLATFORM_LABELS[p]}</span>
                <span style={{ color: status === 'ok' ? '#10b981' : '#f59e0b', fontSize: 12 }}>
                  {status === 'ok' ? '就绪' : `${errCount} 个问题`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>发布到：</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ALL_PLATFORMS.map((p) => (
            <label
              key={p}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                border: selectedPlatforms.has(p) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: 20,
                background: selectedPlatforms.has(p) ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.has(p)}
                onChange={() => togglePlatform(p)}
                style={{ display: 'none' }}
              />
              {PLATFORM_LABELS[p]}
            </label>
          ))}
        </div>
      </div>

      {/* Publish button */}
      <button
        onClick={handlePublish}
        disabled={publishing || !hasAnyContent}
        style={{
          width: '100%',
          padding: '12px 0',
          background: publishing || !hasAnyContent ? '#93c5fd' : '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 700,
          cursor: publishing || !hasAnyContent ? 'not-allowed' : 'pointer',
          marginBottom: 12,
        }}
      >
        {publishing ? '发布中（模拟）...' : '一键发布（模拟）'}
      </button>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            color: '#dc2626',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>发布结果</div>
          {results.map((r) => (
            <div
              key={r.platform}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                marginBottom: 6,
                background:
                  r.status === 'success'
                    ? '#f0fdf4'
                    : r.status === 'validation_error'
                      ? '#fefce8'
                      : '#fef2f2',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 16,
                    color:
                      r.status === 'success'
                        ? '#10b981'
                        : r.status === 'validation_error'
                          ? '#f59e0b'
                          : '#ef4444',
                  }}
                >
                  {r.status === 'success' ? '✅' : r.status === 'validation_error' ? '⚠' : '❌'}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {PLATFORM_LABELS[r.platform as Platform] ?? r.platform}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{r.message}</div>
                  {r.mockUrl && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      模拟链接: {r.mockUrl}
                    </div>
                  )}
                  {r.publishedAt && (
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {new Date(r.publishedAt).toLocaleString('zh-CN')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!publishing && !results && !error && !hasAnyContent && (
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '24px 0' }}>
          <p style={{ marginBottom: 8, fontSize: 28 }}>&#128640;</p>
          <p>先在左侧编辑器中输入内容</p>
          <p>然后回到这里一键发布</p>
        </div>
      )}
    </div>
  );
}
