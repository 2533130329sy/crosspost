import type { CanonicalContent } from '../types/content';
import type { ContentFlow, Platform, PlatformConstraints } from '../types/platform';

export interface ValidationError {
  field: 'title' | 'body' | 'coverImage' | 'tags' | 'mediaAssets';
  code: string;
  message: string;
}

export interface PlatformContent {
  platform: Platform;
  title: string;
  body: string;
  mediaAssets: unknown[];
  metadata: {
    videoPlaceholders?: string[];
    truncatedFrom?: number;
    injectedTags?: string[];
  };
}

export interface IPlatformAdapter {
  readonly platform: Platform;
  readonly displayName: string;
  readonly constraints: PlatformConstraints;
  readonly contentFlow: ContentFlow;

  validate(content: CanonicalContent): ValidationError[];
  convert(content: CanonicalContent): PlatformContent | Promise<PlatformContent>;
  preview(content: CanonicalContent): string | Promise<string>;
}
