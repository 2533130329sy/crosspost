import type { AIGenerateResponse } from '@crosspost/shared';

type Platform = 'wechat' | 'zhihu' | 'bilibili' | 'xiaohongshu' | 'douyin';

interface Task {
  id: string;
  status: 'extracting' | 'generating' | 'completed' | 'error';
  progress: number;
  step: string;
  result?: AIGenerateResponse;
  error?: string;
}

const tasks = new Map<string, Task>();

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

function getApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }
  return key;
}

// ---- Stage 1: Fact extraction ----

const FACT_EXTRACTION_PROMPT = `你是一个专业的内容分析师。分析用户提供的内容，提取核心事实。

返回严格的JSON格式（不要包含任何其他文字）:
{
  "topic": "内容主题（一句话）",
  "keyPoints": ["关键点1", "关键点2", "关键点3"],
  "entities": ["人名/地名/产品名"],
  "tone": "内容调性（professional/casual/emotional/technical）"
}`;

// ---- Stage 2: Platform-specific writer prompts ----

const PLATFORM_PROMPTS: Record<Platform, string> = {
  wechat: `你是微信公众号资深编辑。根据提供的事实信息，撰写一篇适合公众号发布的正式文章。
要求：
- 标题：正式、专业、≤64字
- 正文：使用Markdown格式，段落清晰，逻辑严密
- 风格：专业、有深度、适合深度阅读
- 结构：引言→正文→总结
返回JSON: { "title": "标题", "body": "Markdown正文" }`,

  zhihu: `你是知乎高赞答主。根据提供的事实信息，撰写一篇适合知乎发布的深度文章。
要求：
- 标题：有观点、引人思考、≤100字
- 正文：使用Markdown格式，从H2开始（不用H1）
- 风格：深度、有见解、适合讨论、可带LaTeX公式
- 结构：抛出问题→分析→结论
返回JSON: { "title": "标题", "body": "Markdown正文" }`,

  bilibili: `你是B站知名专栏作者。根据提供的事实信息，撰写一篇适合B站专栏的文章。
要求：
- 标题：活泼、有网感、吸引点击、≤100字
- 正文：使用Markdown格式，生动有趣
- 风格：年轻化、有趣、适合视频平台受众
- 可适当使用网络用语和表情
返回JSON: { "title": "标题", "body": "Markdown正文" }`,

  xiaohongshu: `你是小红书爆款文案写手。根据提供的事实信息，撰写一篇小红书种草笔记。
要求：
- 标题：痛点前置、吸引眼球、≤20字
- 正文：纯文本（不用Markdown），≤1000字
- 风格：爆款公式（痛点+解决方案+使用体验+Emoji）
- 结尾：3-5个话题标签（#开头）
返回JSON: { "title": "标题", "body": "纯文本正文（含话题标签）" }`,

  douyin: `你是抖音短视频运营专家。根据提供的事实信息，撰写抖音视频描述文案。
要求：
- 标题：钩子开头、引发好奇、≤55字
- 正文：纯文本，≤500字，节奏快
- 风格：快节奏、强互动、适合短视频语境
- 结尾：2-3个话题标签（#开头）
返回JSON: { "title": "标题", "body": "纯文本描述（含话题标签）" }`,
};

// ---- Helpers ----

function repairJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const firstBrace = s.indexOf('{');
  if (firstBrace > 0) s = s.slice(firstBrace);
  const lastBrace = s.lastIndexOf('}');
  if (lastBrace > 0 && lastBrace < s.length - 1) s = s.slice(0, lastBrace + 1);
  s = s.replace(/,(\s*[}\]])/g, '$1');
  return s;
}

interface ChatMessage {
  role: 'system' | 'user';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

async function callDeepSeek(
  systemPrompt: string,
  userContent: string,
  images?: string[],
): Promise<Record<string, unknown>> {
  const MAX_RETRIES = 2;
  let lastError: Error | null = null;
  const apiKey = getApiKey();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }

    try {
      const userContentItems: ChatMessage['content'] = [{ type: 'text', text: userContent }];

      if (images?.length) {
        for (const img of images.slice(0, 5)) {
          userContentItems.push({
            type: 'image_url',
            image_url: { url: img },
          });
        }
      }

      const body = {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContentItems },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      };

      const res = await fetch(DEEPSEEK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`DeepSeek API error ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = (await res.json()) as {
        choices: Array<{ message: { content: string } }>;
      };

      const text = data.choices?.[0]?.message?.content ?? '';
      if (!text) throw new Error('Empty response from DeepSeek');

      return JSON.parse(repairJson(text)) as Record<string, unknown>;
    } catch (err) {
      lastError = err as Error;
      if (err instanceof SyntaxError) continue;
      throw err;
    }
  }

  throw lastError ?? new Error('Failed to parse AI response after retries');
}

// ---- Public API ----

export function createTask(content: string, platforms: Platform[], images?: string[]): string {
  const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const task: Task = {
    id,
    status: 'extracting',
    progress: 0,
    step: images?.length ? '正在分析图片内容...' : '正在分析内容...',
  };
  tasks.set(id, task);

  processTask(task, content, platforms, images).catch((err) => {
    task.status = 'error';
    task.error = err instanceof Error ? err.message : 'Unknown error';
  });

  return id;
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id);
}

// ---- Task processing ----

async function processTask(
  task: Task,
  content: string,
  platforms: Platform[],
  images?: string[],
): Promise<void> {
  task.status = 'extracting';
  task.progress = 0.1;
  task.step = '正在分析内容...';

  let facts: Record<string, unknown>;
  try {
    facts = await callDeepSeek(FACT_EXTRACTION_PROMPT, content, images);
  } catch (err) {
    task.status = 'error';
    task.error = `事实提取失败: ${err instanceof Error ? err.message : 'Unknown error'}`;
    return;
  }

  task.progress = 0.3;
  task.status = 'generating';

  const platformHints: Record<string, { title: string; body: string }> = {};
  let globalTitle = '';
  let globalBody = '';
  const allTags: string[] = [];

  const totalPlatforms = platforms.length;
  for (let i = 0; i < totalPlatforms; i++) {
    const platform = platforms[i];
    task.step = `正在生成${platformDisplayName(platform)}文案 (${i + 1}/${totalPlatforms})...`;
    task.progress = 0.3 + (0.6 * (i + 1)) / totalPlatforms;

    try {
      const factsStr = JSON.stringify(facts, null, 2);
      const prompt = PLATFORM_PROMPTS[platform];
      const result = await callDeepSeek(prompt, `基于以下事实信息生成内容:\n${factsStr}`);

      const title = String(result.title ?? '');
      const body = String(result.body ?? '');

      platformHints[platform] = { title, body };

      if (i === 0) {
        globalTitle = title;
        globalBody = body;
      }

      const tagMatch = body.match(/#[\w一-鿿]+/g);
      if (tagMatch) {
        allTags.push(...tagMatch.map((t) => t.replace(/^#/, '')));
      }
    } catch (err) {
      platformHints[platform] = {
        title: `[${platformDisplayName(platform)} 生成失败]`,
        body: `生成时出错: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }

    if (i < totalPlatforms - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  task.status = 'completed';
  task.progress = 1;
  task.step = '生成完成';
  task.result = {
    title: globalTitle,
    body: globalBody,
    tags: [...new Set(allTags)].slice(0, 10),
    platformHints,
  };
}

function platformDisplayName(p: Platform): string {
  const map: Record<Platform, string> = {
    wechat: '公众号',
    zhihu: '知乎',
    bilibili: 'B站',
    xiaohongshu: '小红书',
    douyin: '抖音',
  };
  return map[p];
}
