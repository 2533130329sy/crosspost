import MDEditor from '@uiw/react-md-editor';
import { useEditor } from '../../context/EditorContext';
import { TitleInput } from './TitleInput';

export function EditorPanel() {
  const { activePlatform, platformBodies, setPlatformTitle, setPlatformBody } = useEditor();
  const current = platformBodies[activePlatform];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TitleInput
        value={current?.title ?? ''}
        onChange={(v) => setPlatformTitle(activePlatform, v)}
      />
      <div style={{ flex: 1, overflow: 'auto' }} data-color-mode="light">
        <MDEditor
          value={current?.body ?? ''}
          onChange={(val) => setPlatformBody(activePlatform, val ?? '')}
          preview="live"
          height="100%"
          visibleDragbar={false}
        />
      </div>
    </div>
  );
}
