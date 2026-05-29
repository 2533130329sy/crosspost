import { useState } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';
import { EditorProvider } from './context/EditorContext';
import { PlatformSidebar } from './components/PlatformSelector/PlatformSidebar';
import { EditorPanel } from './components/EditorPanel/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel/PreviewPanel';
import { AIGeneratePanel } from './components/AIGeneratePanel/AIGeneratePanel';
import { PublishPanel } from './components/PublishPanel/PublishPanel';

type RightTab = 'preview' | 'publish';

export default function App() {
  const [aiOpen, setAiOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>('preview');

  return (
    <EditorProvider>
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        {/* Left: Platform sidebar */}
        <PlatformSidebar />

        {/* Center: Editor + Preview/Publish */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Top bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 16px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fff',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setRightTab('preview')}
                style={{
                  padding: '5px 14px',
                  border: rightTab === 'preview' ? '1px solid #3b82f6' : '1px solid #d1d5db',
                  borderRadius: 6,
                  background: rightTab === 'preview' ? '#eff6ff' : '#fff',
                  color: rightTab === 'preview' ? '#3b82f6' : '#6b7280',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                预览
              </button>
              <button
                onClick={() => setRightTab('publish')}
                style={{
                  padding: '5px 14px',
                  border: rightTab === 'publish' ? '1px solid #10b981' : '1px solid #d1d5db',
                  borderRadius: 6,
                  background: rightTab === 'publish' ? '#f0fdf4' : '#fff',
                  color: rightTab === 'publish' ? '#10b981' : '#6b7280',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                发布
              </button>
            </div>
            <button
              onClick={() => setAiOpen(true)}
              style={{
                padding: '6px 16px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              AI 生成
            </button>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <EditorPanel />
          </div>

          {/* Bottom: Preview or Publish */}
          <div style={{ flexShrink: 0, maxHeight: '45%', overflow: 'hidden' }}>
            {rightTab === 'preview' ? <PreviewPanel /> : <PublishPanel />}
          </div>
        </div>

        {/* AI Drawer (overlay) */}
        <AIGeneratePanel open={aiOpen} onClose={() => setAiOpen(false)} />
      </div>
    </EditorProvider>
  );
}
