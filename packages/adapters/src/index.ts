import type { IPlatformAdapter } from '@crosspost/shared';
import { Platform } from '@crosspost/shared';

const registry = new Map<Platform, IPlatformAdapter>();

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
