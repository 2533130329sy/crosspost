import { Platform } from '@crosspost/shared';
import { useEditor } from '../../context/EditorContext';

const PLATFORMS = [
  { id: Platform.WECHAT, label: '公众号', icon: '微', color: '#07c160' },
  { id: Platform.ZHIHU, label: '知乎', icon: '知', color: '#0066ff' },
  { id: Platform.BILIBILI, label: 'B站', icon: 'B', color: '#fb7299' },
  { id: Platform.XIAOHONGSHU, label: '小红书', icon: '书', color: '#ff2442' },
  { id: Platform.DOUYIN, label: '抖音', icon: '抖', color: '#000' },
];

export function PlatformSidebar() {
  const { activePlatform, setActivePlatform, platformBodies } = useEditor();

  return (
    <div
      style={{
        width: 64,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e5e7eb',
        background: '#f9fafb',
        flexShrink: 0,
      }}
    >
      {PLATFORMS.map((p) => {
        const hasContent = platformBodies[p.id]?.body?.trim().length > 0;
        const isActive = activePlatform === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setActivePlatform(p.id)}
            title={p.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '10px 4px',
              border: 'none',
              borderLeft: isActive ? `3px solid ${p.color}` : '3px solid transparent',
              background: isActive ? '#fff' : 'transparent',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isActive ? p.color : '#e5e7eb',
                color: isActive ? '#fff' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {p.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                color: isActive ? p.color : '#9ca3af',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {p.label.slice(0, 2)}
            </span>
            {hasContent && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
