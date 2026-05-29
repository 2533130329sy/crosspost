import { useState } from 'react';
import '@uiw/react-md-editor/markdown-editor.css';
import { EditorProvider } from './context/EditorContext';
import { EditorPanel } from './components/EditorPanel/EditorPanel';
import { AIGeneratePanel } from './components/AIGeneratePanel/AIGeneratePanel';
import { PreviewPanel } from './components/PreviewPanel/PreviewPanel';

type RightTab = 'ai' | 'preview';

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
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rightTab === 'ai' ? <AIGeneratePanel /> : <PreviewPanel />}
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
