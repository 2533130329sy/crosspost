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
  wechat: `你是《人民日报》特约评论员。根据下面的事实信息，写一篇正式深度长文。
【强制要求】：
- 标题：正式书面语，要有思想深度，15-40字
- 正文：Markdown格式，3-5个大段落，每段有小标题（##）
- 风格：严肃、权威、逻辑严密。用词正式（如"笔者认为""值得深思的是""纵观全局"）
- 绝对不要用：Emoji、网络梗、口语化表达、感叹号
- 开头用一句名言或格言引出主题，结尾给出深刻的总结和展望
返回JSON: { "title": "...", "body": "## 小标题\\n\\n正文段落..." }`,

  zhihu: `你是知乎10万粉大V。根据下面的事实信息，写一篇知乎高赞回答风格的文章。
【强制要求】：
- 标题：必须是问句形式，以"？"结尾，引发思考，20-60字
- 正文：Markdown格式，从## 开始
- 风格：第一人称视角（"我""咱们"），分享个人经验+数据支撑，语气真诚
- 开头：先讲一个小故事或亲身经历（2-3句），再切入正题
- 中间：分2-3个观点，每个观点配一个生活例子
- 结尾：抛出一个开放性问题让读者讨论
- 可以有适度幽默，但要有干货
返回JSON: { "title": "...", "body": "## ..." }`,

  bilibili: `你是B站百万粉UP主。根据下面的事实信息，写一篇B站专栏。
【强制要求】：
- 标题：必须用震惊体或疑问体，吸引点击，如"居然""万万没想到""99%的人不知道"
- 正文：Markdown格式
- 风格：极度口语化，大量使用B站流行语（"家人们""绝绝子""yyds""属实""这波"）
- 必须包含弹幕互动元素，如"（弹幕：笑死）""（前方高能）"
- 多用拟声词和夸张表达（"炸裂""离谱""卧槽"）
- 段落要短（2-3句一段），多用空行
- 结尾：求三连（点赞投币收藏）
返回JSON: { "title": "...", "body": "..." }`,

  xiaohongshu: `你是小红书10万粉美妆/生活博主。根据下面的事实信息，写一篇小红书爆款笔记。
【强制要求】：
- 标题：短小精悍，必须有Emoji开头和结尾，≤20字，如"痛到窒息...这个办法绝了"
- 正文：纯文本，不能有任何Markdown格式符号
- 结构：
  第1段：1-2句痛点共鸣（"姐妹们谁懂啊..."）
  第2段：3-4句个人真实体验（"我试了XX之后..."）
  第3段：2-3句使用感受对比
- 每句话末尾至少有1个Emoji（😭✨🔥💯🍃💡等）
- 正文末尾：空一行后加5-8个话题标签（#开头）
- 字数控制在300-800字
- 语气：像闺蜜聊天，亲切、真诚、有感染力
返回JSON: { "title": "...", "body": "纯文本（含Emoji和#话题标签）" }`,

  douyin: `你是抖音千万粉丝网红。根据下面的事实信息，写一条抖音视频文案。
【强制要求】：
- 正文：纯文本，≤300字，不能有任何Markdown
- 第1句：必须是"钩子"——一个让人震惊/好奇的短句，如"你知道吗？""千万别再..." "这个秘密没人告诉你"
- 中间：3-5句干货，每句一行，干净利落
- 最后一句：引导互动（"评论区告诉我""你遇到过吗""转发给你的XX"）
- 末尾：2-3个#话题标签
- 标题：单独撰写，要有紧迫感，≤40字
- 整体语气：快节奏、制造焦虑或好奇心
返回JSON: { "title": "...", "body": "纯文本（含#话题标签）" }`,
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
      // DeepSeek-chat doesn't support images natively; add a note instead
      let promptText = userContent;
      if (images?.length) {
        promptText = userContent + `\n\n（用户上传了${images.length}张图片，但DeepSeek暂不支持直接图片分析，请基于文字内容生成）`;
      }

      const body = {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText },
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
