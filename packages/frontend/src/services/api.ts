import type { AIGenerateResponse } from '@crosspost/shared';

interface TaskStatus {
  id: string;
  status: 'extracting' | 'generating' | 'completed' | 'error';
  progress: number;
  step: string;
  result: AIGenerateResponse | null;
  error: string | null;
}

export async function startGeneration(content: string, platforms: string[]): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, platforms }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.guide || `Request failed: ${res.status}`);
  }

  const { taskId } = (await res.json()) as { taskId: string };
  return taskId;
}

export async function pollTask(
  taskId: string,
  onProgress: (status: TaskStatus) => void,
  signal?: AbortSignal,
): Promise<AIGenerateResponse> {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      if (signal?.aborted) {
        reject(new Error('Polling aborted'));
        return;
      }

      try {
        const res = await fetch(`/api/generate/${taskId}`);
        if (!res.ok) throw new Error(`Poll failed: ${res.status}`);

        const status = (await res.json()) as TaskStatus;
        onProgress(status);

        if (status.status === 'completed' && status.result) {
          resolve(status.result);
          return;
        }

        if (status.status === 'error') {
          reject(new Error(status.error ?? 'Generation failed'));
          return;
        }

        setTimeout(poll, 500);
      } catch (err) {
        reject(err);
      }
    };

    poll();
  });
}
