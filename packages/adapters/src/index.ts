import type { IPlatformAdapter } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';
import { WechatAdapter } from './wechat/wechat.adapter';
import { ZhihuAdapter } from './zhihu/zhihu.adapter';
import { BilibiliAdapter } from './bilibili/bilibili.adapter';

const registry = new Map<Platform, IPlatformAdapter>();

const wechat = new WechatAdapter();
const zhihu = new ZhihuAdapter();
const bilibili = new BilibiliAdapter();

registry.set(wechat.platform, wechat);
registry.set(zhihu.platform, zhihu);
registry.set(bilibili.platform, bilibili);

export function registerAdapter(adapter: IPlatformAdapter): void {
  registry.set(adapter.platform, adapter);
}

export function getAdapter(platform: Platform): IPlatformAdapter {
  const adapter = registry.get(platform);
  if (!adapter) {
    throw new Error(`No adapter registered for platform: ${platform}`);
  }
  return adapter;
}

export function getRegisteredPlatforms(): Platform[] {
  return Array.from(registry.keys());
}

export { WechatAdapter } from './wechat/wechat.adapter';
export { ZhihuAdapter } from './zhihu/zhihu.adapter';
export { BilibiliAdapter } from './bilibili/bilibili.adapter';
