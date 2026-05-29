export interface AIGenerateRequest {
  content: string;
  mediaUrls?: string[];
  platforms: string[];
}

export interface PlatformHint {
  title: string;
  body: string;
}

export interface AIGenerateResponse {
  title: string;
  body: string;
  tags: string[];
  platformHints: Record<string, PlatformHint>;
}

export interface AIError {
  error: string;
  code: 'API_KEY_NOT_CONFIGURED' | 'RATE_LIMITED' | 'PARSE_ERROR' | 'UNKNOWN';
  guide?: string;
}
