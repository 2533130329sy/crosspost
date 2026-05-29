export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  dataUrl: string;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
}

export interface CanonicalContent {
  title: string;
  body: string;
  mediaAssets: MediaAsset[];
  coverIndex: number;
  tags: string[];
}
