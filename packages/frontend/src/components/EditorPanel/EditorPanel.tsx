import MDEditor from '@uiw/react-md-editor';
import { useEditor } from '../../context/EditorContext';
import { TitleInput } from './TitleInput';

export function EditorPanel() {
  const { body, setBody } = useEditor();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TitleInput />
      <div style={{ flex: 1, overflow: 'auto' }} data-color-mode="light">
        <MDEditor
          value={body}
          onChange={(val) => setBody(val ?? '')}
          preview="live"
          height="100%"
          visibleDragbar={false}
        />
      </div>
    </div>
  );
}
