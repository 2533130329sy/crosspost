import { useCallback, useState } from 'react';
import { Platform } from '@crosspost/shared';
import type { AIGenerateResponse, MediaAsset } from '@crosspost/shared';
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

interface StepInfo {
  progress: number;
  step: string;
}

export function AIGeneratePanel() {
  const { body, setBody, setTitle, setPlatformTags, setAiPlatformHints } = useEditor();
  const [inputContent, setInputContent] = useState('');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(
    new Set(ALL_PLATFORMS),
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<StepInfo | null>(null);
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
    const content = entryMode === 'editor' ? body : inputContent;
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
      const imageUrls = mediaAssets.filter((a) => a.type === 'image').map((a) => a.dataUrl);
      const taskId = await startGeneration(content, platforms, imageUrls.length > 0 ? imageUrls : undefined);

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
  }, [body, inputContent, entryMode, selectedPlatforms]);

  const fillEditor = useCallback(
    (platformHint?: { title: string; body: string }) => {
      if (platformHint) {
        setTitle(platformHint.title);
        setBody(platformHint.body);
      } else if (result) {
        setTitle(result.title);
        setBody(result.body);
      }
    },
    [result, setTitle, setBody],
  );

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600 }}>AI 文案生成</h3>

      {/* Entry mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setEntryMode('editor')}
          style={{
            padding: '6px 12px',
            border: entryMode === 'editor' ? '2px solid #3b82f6' : '1px solid #d1d5db',
            borderRadius: 6,
            background: entryMode === 'editor' ? '#eff6ff' : '#fff',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          使用编辑器内容
        </button>
        <button
          onClick={() => setEntryMode('custom')}
          style={{
            padding: '6px 12px',
            border: entryMode === 'custom' ? '2px solid #3b82f6' : '1px solid #d1d5db',
            borderRadius: 6,
            background: entryMode === 'custom' ? '#eff6ff' : '#fff',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          粘贴其他内容
        </button>
      </div>

      {/* Media upload */}
      <MediaUpload assets={mediaAssets} onAssetsChange={setMediaAssets} />

      {/* Custom input */}
      {entryMode === 'custom' && (
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="粘贴长文、笔记或其他内容...&#10;&#10;也可以输入主题描述，让 AI 帮你从零创作"
          rows={6}
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

      {/* Platform selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>目标平台：</div>
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

      {/* Generate button */}
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

      {/* Step progress */}
      {loading && step && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#6b7280',
              marginBottom: 4,
            }}
          >
            <span>{step.step}</span>
            <span>{Math.round(step.progress * 100)}%</span>
          </div>
          <div
            style={{
              height: 4,
              background: '#e5e7eb',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round(step.progress * 100)}%`,
                background: '#3b82f6',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>生成结果</span>
            <button
              onClick={() => fillEditor()}
              style={{
                padding: '4px 10px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              全部填入编辑器
            </button>
          </div>

          {/* Per-platform accordion */}
          {Object.entries(result.platformHints).map(([platform, hint]) => (
            <div
              key={platform}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                marginBottom: 8,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() =>
                  setExpandedPlatform(expandedPlatform === platform ? null : platform)
                }
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  border: 'none',
                  background: '#f9fafb',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <span>
                  {PLATFORM_LABELS[platform as Platform] ?? platform}
                  <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: 12, fontWeight: 400 }}>
                    {hint.title.slice(0, 30)}{hint.title.length > 30 ? '...' : ''}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                  {expandedPlatform === platform ? '收起 ▲' : '展开 ▼'}
                </span>
              </button>
              {expandedPlatform === platform && (
                <div style={{ padding: 12 }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>标题</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{hint.title}</div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>正文</div>
                    <div
                      style={{
                        fontSize: 13,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 200,
                        overflow: 'auto',
                        background: '#f9fafb',
                        padding: 8,
                        borderRadius: 4,
                      }}
                    >
                      {hint.body}
                    </div>
                  </div>
                  <button
                    onClick={() => fillEditor(hint)}
                    style={{
                      padding: '4px 10px',
                      background: '#3b82f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    用此文案填入编辑器
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div
          style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 13,
            padding: '24px 0',
          }}
        >
          <p style={{ marginBottom: 8, fontSize: 28 }}>&#10024;</p>
          <p>选择"使用编辑器内容"或"粘贴其他内容"</p>
          <p>勾选目标平台，点击生成</p>
        </div>
      )}
    </div>
  );
}
