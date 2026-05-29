import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Platform } from '@crosspost/shared';
import type { MediaAsset } from '@crosspost/shared';

interface EditorState {
  title: string;
  body: string;
  tags: Record<Platform, string[]>;
  mediaAssets: MediaAsset[];
}

interface EditorContextValue extends EditorState {
  setTitle: (title: string) => void;
  setBody: (body: string) => void;
  setPlatformTags: (platform: Platform, tags: string[]) => void;
  setMediaAssets: (assets: MediaAsset[]) => void;
}

const defaultTags: Record<Platform, string[]> = {
  [Platform.WECHAT]: [],
  [Platform.ZHIHU]: [],
  [Platform.BILIBILI]: [],
  [Platform.XIAOHONGSHU]: [],
  [Platform.DOUYIN]: [],
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<Record<Platform, string[]>>(defaultTags);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  const setPlatformTags = useCallback((platform: Platform, newTags: string[]) => {
    setTags((prev) => ({ ...prev, [platform]: newTags }));
  }, []);

  const value = useMemo(
    () => ({ title, body, tags, mediaAssets, setTitle, setBody, setPlatformTags, setMediaAssets }),
    [title, body, tags, mediaAssets, setPlatformTags],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}
