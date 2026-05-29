import { getAdapter } from '@crosspost/adapters';
import type { CanonicalContent, ValidationError } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';

type PlatformStr = 'wechat' | 'zhihu' | 'bilibili' | 'xiaohongshu' | 'douyin';

export interface PublishResult {
  platform: PlatformStr;
  status: 'success' | 'validation_error' | 'publish_error';
  message: string;
  publishedAt?: string;
  mockUrl?: string;
  errors?: ValidationError[];
}

const PLATFORM_LABELS: Record<PlatformStr, string> = {
  wechat: '公众号', zhihu: '知乎', bilibili: 'B站',
  xiaohongshu: '小红书', douyin: '抖音',
};

function platformLabel(p: PlatformStr): string {
  return PLATFORM_LABELS[p];
}

function mockUrl(p: PlatformStr): string {
  const id = Math.random().toString(36).slice(2, 10);
  const map: Record<Platform, string> = {
    wechat: `https://mp.weixin.qq.com/s/mock-${id}`,
    zhihu: `https://zhuanlan.zhihu.com/p/mock-${id}`,
    bilibili: `https://www.bilibili.com/read/cv${Math.floor(Math.random() * 100000)}`,
    xiaohongshu: `https://www.xiaohongshu.com/explore/mock-${id}`,
    douyin: `https://www.douyin.com/video/mock-${id}`,
  };
  return map[p];
}

async function simulateDelay(): Promise<void> {
  const ms = 500 + Math.random() * 1500;
  return new Promise((r) => setTimeout(r, ms));
}

export async function publishToPlatform(
  content: CanonicalContent,
  platform: Platform,
): Promise<PublishResult> {
  try {
    const adapter = getAdapter(platform);

    // Validate
    const errors = adapter.validate(content);
    if (errors.length > 0) {
      const severeErrors = errors.filter(
        (e: ValidationError) =>
          e.code === 'MISSING_IMAGES' || e.code === 'MISSING_VIDEO' || e.code === 'TOO_LONG',
      );
      if (severeErrors.length > 0) {
        return {
          platform,
          status: 'validation_error',
          message: `验证失败: ${severeErrors.map((e: ValidationError) => e.message).join('; ')}`,
          errors: severeErrors,
        };
      }
    }

    // Convert
    await adapter.convert(content);

    // Simulate publish
    await simulateDelay();

    return {
      platform,
      status: 'success',
      message: `已成功发布到${platformLabel(platform)}`,
      publishedAt: new Date().toISOString(),
      mockUrl: mockUrl(platform),
    };
  } catch (err) {
    return {
      platform,
      status: 'publish_error',
      message: `发布失败: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

export async function publishAll(
  content: CanonicalContent,
  platforms: Platform[],
): Promise<PublishResult[]> {
  const results: PublishResult[] = [];

  // Publish sequentially (not parallel, to match real-world flow)
  for (const platform of platforms) {
    const result = await publishToPlatform(content, platform);
    results.push(result);

    // Log each result
    console.log(
      `[crosspost] Publish to ${platform}: ${result.status} - ${result.message}`,
    );
  }

  return results;
}
