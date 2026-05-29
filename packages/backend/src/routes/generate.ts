import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { createTask, getTask } from '../services/ai-generator.js';

const router: RouterType = Router();

router.post('/generate', (req, res) => {
  if (!process.env.DEEPSEEK_API_KEY) {
    res.status(400).json({
      error: 'DEEPSEEK_API_KEY not configured',
      code: 'API_KEY_NOT_CONFIGURED',
      guide: 'Copy .env.example to .env and add your Anthropic API key.',
    });
    return;
  }

  const { content, platforms, mediaUrls } = req.body as {
    content?: string;
    platforms?: string[];
    mediaUrls?: string[];
  };

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Content is required', code: 'INVALID_INPUT' });
    return;
  }

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    res.status(400).json({ error: 'At least one platform is required', code: 'INVALID_INPUT' });
    return;
  }

  const validPlatforms = ['wechat', 'zhihu', 'bilibili', 'xiaohongshu', 'douyin'];
  const filtered = platforms.filter((p) => validPlatforms.includes(p));
  if (filtered.length === 0) {
    res.status(400).json({ error: 'No valid platforms selected', code: 'INVALID_INPUT' });
    return;
  }

  const taskId = createTask(
    content.trim(),
    filtered as Array<'wechat' | 'zhihu' | 'bilibili' | 'xiaohongshu' | 'douyin'>,
    mediaUrls?.slice(0, 5),
  );
  res.json({ taskId });
});

router.get('/generate/:taskId', (req, res) => {
  const task = getTask(req.params.taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
    return;
  }

  res.json({
    id: task.id,
    status: task.status,
    progress: task.progress,
    step: task.step,
    result: task.result ?? null,
    error: task.error ?? null,
  });
});

export default router;
