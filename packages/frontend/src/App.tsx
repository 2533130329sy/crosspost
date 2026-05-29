import '@uiw/react-md-editor/markdown-editor.css';
import { EditorProvider } from './context/EditorContext';
import { EditorPanel } from './components/EditorPanel/EditorPanel';
import { AIGeneratePanel } from './components/AIGeneratePanel/AIGeneratePanel';

export default function App() {
  return (
    <EditorProvider>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            flex: '1 1 50%',
            borderRight: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          <EditorPanel />
        </div>
        <div
          style={{
            flex: '1 1 50%',
            overflow: 'hidden',
          }}
        >
          <AIGeneratePanel />
        </div>
      </div>
    </EditorProvider>
  );
}
