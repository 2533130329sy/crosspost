export enum Platform {
  WECHAT = 'wechat',
  ZHIHU = 'zhihu',
  BILIBILI = 'bilibili',
  XIAOHONGSHU = 'xiaohongshu',
  DOUYIN = 'douyin',
}

export enum ContentFlow {
  LONG_FORM = 'long_form',
  SHORT_FORM = 'short_form',
}

export interface PlatformConstraints {
  maxTitleLength: number;
  maxBodyLength: number;
  minImages: number;
  maxImages: number;
  outputFormat: 'html' | 'markdown' | 'plaintext';
  supportsCodeBlock: boolean;
  supportsLatex: boolean;
  supportsVideoEmbed: boolean;
  supportsTags: boolean;
}
