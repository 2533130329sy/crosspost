import '@uiw/react-md-editor/markdown-editor.css';
import { EditorProvider } from './context/EditorContext';
import { EditorPanel } from './components/EditorPanel/EditorPanel';

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: 8, fontSize: 32 }}>&#128270;</p>
            <p>Preview panel coming in PR7</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>
              Select platforms to see formatted previews
            </p>
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}
