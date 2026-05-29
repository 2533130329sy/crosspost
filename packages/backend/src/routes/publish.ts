import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { Platform } from '@crosspost/shared';
import type { CanonicalContent } from '@crosspost/shared';
import { publishToPlatform } from '../services/publisher.js';
import type { PublishResult } from '../services/publisher.js';

const router: RouterType = Router();

router.post('/publish', async (req, res, next) => {
  try {
    const { contents, platforms } = req.body as {
      contents?: Record<string, CanonicalContent>;
      platforms?: string[];
    };

    if (!contents || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      res.status(400).json({ error: 'contents and platforms are required', code: 'INVALID_INPUT' });
      return;
    }

    const validPlatforms = Object.values(Platform) as string[];
    const filtered = platforms.filter((p) => validPlatforms.includes(p)) as Platform[];

    const results: PublishResult[] = [];
    for (const platform of filtered) {
      const content = contents[platform];
      if (!content?.body) {
        results.push({
          platform: platform as PublishResult['platform'],
          status: 'validation_error',
          message: `缺少${platform}平台内容`,
        });
        continue;
      }
      const result = await publishToPlatform(content, platform);
      results.push(result);
    }

    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;
