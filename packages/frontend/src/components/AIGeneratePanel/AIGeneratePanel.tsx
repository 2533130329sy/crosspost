import { useCallback, useState } from 'react';
import { Platform } from '@crosspost/shared';
import type { AIGenerateResponse } from '@crosspost/shared';
import { useEditor } from '../../context/EditorContext';
import { pollTask, startGeneration } from '../../services/api';
import { MediaUpload } from '../MediaUpload/MediaUpload';

const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.WECHAT]: '公众号',
  [Platform.ZHIHU]: '知乎',
  [Platform.BILIBILI]: 'B站',
  [Platform.XIAOHONGSHU]: '小红书',
  [Platform.DOUYIN]: '抖音',
};

const ALL_PLATFORMS = Object.values(Platform);

interface AIGeneratePanelProps {
  open: boolean;
  onClose: () => void;
}

export function AIGeneratePanel({ open, onClose }: AIGeneratePanelProps) {
  const { platformBodies, setPlatformTitle, setPlatformBody, setAiPlatformHints } = useEditor();
  const [inputContent, setInputContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(
    new Set(ALL_PLATFORMS),
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<{ progress: number; step: string } | null>(null);
  const [result, setResult] = useState<AIGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<'editor' | 'custom'>('editor');

  const togglePlatform = useCallback((p: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    const activeContent = platformBodies[Platform.WECHAT];
    const bodyContent = entryMode === 'editor' ? activeContent?.body : inputContent;
    const content = bodyContent || inputContent || '';

    if (!content.trim()) {
      setError('请输入或粘贴内容后再生成');
      return;
    }
    if (selectedPlatforms.size === 0) {
      setError('请至少选择一个平台');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setStep({ progress: 0, step: '正在提交...' });

    try {
      const platforms = Array.from(selectedPlatforms);
      const taskId = await startGeneration(content, platforms);

      const data = await pollTask(taskId, (status) => {
        setStep({ progress: status.progress, step: status.step });
      });

      setResult(data);
      setAiPlatformHints(data.platformHints);
      setStep({ progress: 1, step: '生成完成' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [platformBodies, inputContent, entryMode, selectedPlatforms, setAiPlatformHints]);

  const fillAllToEditor = useCallback(() => {
    if (!result) return;
    for (const [platform, hint] of Object.entries(result.platformHints)) {
      setPlatformTitle(platform as Platform, hint.title);
      setPlatformBody(platform as Platform, hint.body);
    }
    onClose();
  }, [result, setPlatformTitle, setPlatformBody, onClose]);

  const fillPlatformToEditor = useCallback(
    (platform: string, hint: { title: string; body: string }) => {
      setPlatformTitle(platform as Platform, hint.title);
      setPlatformBody(platform as Platform, hint.body);
    },
    [setPlatformTitle, setPlatformBody],
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 40,
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 420,
          maxWidth: '90vw',
          height: '100vh',
          background: '#fff',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>AI 文案生成</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#9ca3af',
            }}
          >
            x
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {/* Entry mode */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setEntryMode('editor')}
              style={{
                flex: 1,
                padding: '6px 0',
                border: entryMode === 'editor' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: 6,
                background: entryMode === 'editor' ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              用公众号内容生成
            </button>
            <button
              onClick={() => setEntryMode('custom')}
              style={{
                flex: 1,
                padding: '6px 0',
                border: entryMode === 'custom' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: 6,
                background: entryMode === 'custom' ? '#eff6ff' : '#fff',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              粘贴其他内容
            </button>
          </div>

          {entryMode === 'custom' && (
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="粘贴长文、笔记或其他内容..."
              rows={4}
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                resize: 'vertical',
                fontSize: 13,
                boxSizing: 'border-box',
                marginBottom: 12,
              }}
            />
          )}

          <MediaUpload
            assets={[]}
            onAssetsChange={() => {}}
          />

          {/* Platform selector */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>生成到：</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {ALL_PLATFORMS.map((p) => (
                <label
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '3px 8px',
                    border: selectedPlatforms.has(p) ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: 16,
                    background: selectedPlatforms.has(p) ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
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

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 0',
              background: loading ? '#93c5fd' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 12,
            }}
          >
            {loading ? '生成中...' : '生成文案'}
          </button>

          {error && (
            <div style={{
              padding: 8,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 6,
              color: '#dc2626',
              fontSize: 12,
              marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          {loading && step && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                <span>{step.step}</span>
                <span>{Math.round(step.progress * 100)}%</span>
              </div>
              <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(step.progress * 100)}%`, background: '#3b82f6', borderRadius: 2, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {result && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>生成结果</span>
                <button
                  onClick={fillAllToEditor}
                  style={{
                    padding: '5px 12px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  全部填入编辑器
                </button>
              </div>

              {Object.entries(result.platformHints).map(([platform, hint]) => (
                <div
                  key={platform}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    marginBottom: 6,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setExpandedPlatform(expandedPlatform === platform ? null : platform)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      border: 'none',
                      background: '#f9fafb',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    <span>
                      {PLATFORM_LABELS[platform as Platform] ?? platform}
                      <span style={{ color: '#9ca3af', marginLeft: 6, fontSize: 11, fontWeight: 400 }}>
                        {hint.title.slice(0, 20)}...
                      </span>
                    </span>
                    <span style={{ fontSize: 11 }}>
                      {expandedPlatform === platform ? '收起' : '展开'}
                    </span>
                  </button>
                  {expandedPlatform === platform && (
                    <div style={{ padding: 10 }}>
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>标题</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{hint.title}</div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>正文</div>
                        <div style={{ fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto', background: '#f9fafb', padding: 6, borderRadius: 4 }}>
                          {hint.body}
                        </div>
                      </div>
                      <button
                        onClick={() => fillPlatformToEditor(platform, hint)}
                        style={{
                          padding: '3px 8px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        填入{PLATFORM_LABELS[platform as Platform]}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !result && !error && (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, padding: '20px 0' }}>
              <p style={{ fontSize: 24, marginBottom: 6 }}>&#10024;</p>
              <p>输入内容后点击生成</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
