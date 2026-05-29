import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { Platform } from '@crosspost/shared';
import type { CanonicalContent } from '@crosspost/shared';
import { publishAll } from '../services/publisher.js';

const router: RouterType = Router();

router.post('/publish', async (req, res, next) => {
  try {
    const { content, platforms } = req.body as {
      content?: CanonicalContent;
      platforms?: string[];
    };

    if (!content?.body) {
      res.status(400).json({ error: 'Content with body is required', code: 'INVALID_INPUT' });
      return;
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      res.status(400).json({ error: 'At least one platform is required', code: 'INVALID_INPUT' });
      return;
    }

    const validPlatforms = Object.values(Platform) as string[];
    const filtered = platforms.filter((p) => validPlatforms.includes(p)) as Platform[];

    const results = await publishAll(content, filtered);

    res.json({ results });
  } catch (err) {
    next(err);
  }
});

export default router;
