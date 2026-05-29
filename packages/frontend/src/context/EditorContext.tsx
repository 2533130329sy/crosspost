import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from '@crosspost/shared';
import type { MediaAsset } from '@crosspost/shared';

export interface PlatformContent {
  title: string;
  body: string;
}

interface EditorState {
  platformBodies: Record<Platform, PlatformContent>;
  activePlatform: Platform;
  tags: Record<Platform, string[]>;
  mediaAssets: MediaAsset[];
  aiPlatformHints: Record<string, PlatformContent> | null;
}

interface EditorContextValue extends EditorState {
  setActivePlatform: (platform: Platform) => void;
  setPlatformTitle: (platform: Platform, title: string) => void;
  setPlatformBody: (platform: Platform, body: string) => void;
  setPlatformTags: (platform: Platform, tags: string[]) => void;
  setMediaAssets: (assets: MediaAsset[]) => void;
  setAiPlatformHints: (hints: Record<string, PlatformContent> | null) => void;
}

const emptyPlatform = (): PlatformContent => ({ title: '', body: '' });

const defaultBodies: Record<Platform, PlatformContent> = {
  [Platform.WECHAT]: emptyPlatform(),
  [Platform.ZHIHU]: emptyPlatform(),
  [Platform.BILIBILI]: emptyPlatform(),
  [Platform.XIAOHONGSHU]: emptyPlatform(),
  [Platform.DOUYIN]: emptyPlatform(),
};

const defaultTags: Record<Platform, string[]> = {
  [Platform.WECHAT]: [],
  [Platform.ZHIHU]: [],
  [Platform.BILIBILI]: [],
  [Platform.XIAOHONGSHU]: [],
  [Platform.DOUYIN]: [],
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [platformBodies, setPlatformBodies] = useState(defaultBodies);
  const [activePlatform, setActivePlatform] = useState<Platform>(Platform.WECHAT);
  const [tags, setTags] = useState<Record<Platform, string[]>>(defaultTags);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [aiPlatformHints, setAiPlatformHints] = useState<Record<string, PlatformContent> | null>(null);

  const setPlatformTitle = useCallback((platform: Platform, title: string) => {
    setPlatformBodies((prev) => ({ ...prev, [platform]: { ...prev[platform], title } }));
  }, []);

  const setPlatformBody = useCallback((platform: Platform, body: string) => {
    setPlatformBodies((prev) => ({ ...prev, [platform]: { ...prev[platform], body } }));
  }, []);

  const setPlatformTags = useCallback((platform: Platform, newTags: string[]) => {
    setTags((prev) => ({ ...prev, [platform]: newTags }));
  }, []);

  const value = useMemo(
    () => ({
      platformBodies, activePlatform, tags, mediaAssets, aiPlatformHints,
      setActivePlatform, setPlatformTitle, setPlatformBody,
      setPlatformTags, setMediaAssets, setAiPlatformHints,
    }),
    [platformBodies, activePlatform, tags, mediaAssets, aiPlatformHints,
     setPlatformTitle, setPlatformBody, setPlatformTags],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}
