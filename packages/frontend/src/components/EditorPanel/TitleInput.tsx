import { useEditor } from '../../context/EditorContext';

export function TitleInput() {
  const { title, setTitle } = useEditor();

  return (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="输入标题..."
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: 20,
        fontWeight: 600,
        border: 'none',
        borderBottom: '1px solid #e5e7eb',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}
