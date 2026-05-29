import { Platform } from '@crosspost/shared';

const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.WECHAT]: '公众号',
  [Platform.ZHIHU]: '知乎',
  [Platform.BILIBILI]: 'B站',
  [Platform.XIAOHONGSHU]: '小红书',
  [Platform.DOUYIN]: '抖音',
};

const ALL_PLATFORMS = Object.values(Platform);

interface PlatformSelectorProps {
  active: Platform | null;
  onSelect: (platform: Platform) => void;
}

export function PlatformSelector({ active, onSelect }: PlatformSelectorProps) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
      {ALL_PLATFORMS.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          style={{
            flex: 1,
            padding: '8px 4px',
            border: 'none',
            borderBottom: active === p ? '2px solid #3b82f6' : '2px solid transparent',
            background: active === p ? '#eff6ff' : 'transparent',
            color: active === p ? '#3b82f6' : '#6b7280',
            fontSize: 13,
            fontWeight: active === p ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {PLATFORM_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
