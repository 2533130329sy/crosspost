import { useState } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';
import { EditorProvider } from './context/EditorContext';
import { EditorPanel } from './components/EditorPanel/EditorPanel';
import { AIGeneratePanel } from './components/AIGeneratePanel/AIGeneratePanel';
import { PreviewPanel } from './components/PreviewPanel/PreviewPanel';
import { PublishPanel } from './components/PublishPanel/PublishPanel';

type RightTab = 'ai' | 'preview' | 'publish';

export default function App() {
  const [rightTab, setRightTab] = useState<RightTab>('ai');

  return (
    <EditorProvider>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Left: Editor */}
        <div
          style={{
            flex: '1 1 45%',
            borderRight: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <EditorPanel />
        </div>

        {/* Right: AI / Preview */}
        <div
          style={{
            flex: '1 1 55%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
            <button
              onClick={() => setRightTab('ai')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderBottom: rightTab === 'ai' ? '2px solid #3b82f6' : '2px solid transparent',
                background: rightTab === 'ai' ? '#eff6ff' : 'transparent',
                color: rightTab === 'ai' ? '#3b82f6' : '#6b7280',
                fontSize: 14,
                fontWeight: rightTab === 'ai' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              AI 生成
            </button>
            <button
              onClick={() => setRightTab('preview')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderBottom: rightTab === 'preview' ? '2px solid #3b82f6' : '2px solid transparent',
                background: rightTab === 'preview' ? '#eff6ff' : 'transparent',
                color: rightTab === 'preview' ? '#3b82f6' : '#6b7280',
                fontSize: 14,
                fontWeight: rightTab === 'preview' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              平台预览
            </button>
            <button
              onClick={() => setRightTab('publish')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderBottom: rightTab === 'publish' ? '2px solid #10b981' : '2px solid transparent',
                background: rightTab === 'publish' ? '#f0fdf4' : 'transparent',
                color: rightTab === 'publish' ? '#10b981' : '#6b7280',
                fontSize: 14,
                fontWeight: rightTab === 'publish' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              发布
            </button>
          </div>

          {/* Tab content — all mounted, hidden instead of unmounted to preserve state */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: rightTab === 'ai' ? 'block' : 'none', height: '100%' }}>
              <AIGeneratePanel />
            </div>
            <div style={{ display: rightTab === 'preview' ? 'block' : 'none', height: '100%' }}>
              <PreviewPanel />
            </div>
            <div style={{ display: rightTab === 'publish' ? 'block' : 'none', height: '100%' }}>
              <PublishPanel />
            </div>
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
