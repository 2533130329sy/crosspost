import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { CanonicalContent, IPlatformAdapter, PlatformContent, ValidationError } from '@crosspost/shared';
import { ContentFlow, Platform } from '@crosspost/shared';
import type { PlatformConstraints } from '@crosspost/shared';

export abstract class BaseAdapter implements IPlatformAdapter {
  abstract readonly platform: Platform;
  abstract readonly displayName: string;
  abstract readonly constraints: PlatformConstraints;

  get contentFlow(): ContentFlow {
    return ContentFlow.LONG_FORM;
  }

  /** Convert GFM markdown to HTML string */
  protected async markdownToHtml(md: string): Promise<string> {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify)
      .process(md);

    return String(file.value);
  }

  /** Base validation: check title and body length against platform constraints */
  validate(content: CanonicalContent): ValidationError[] {
    const errors: ValidationError[] = [];
    const c = this.constraints;

    if (content.title.length > c.maxTitleLength) {
      errors.push({
        field: 'title',
        code: 'TOO_LONG',
        message: `标题不能超过${c.maxTitleLength}字，当前${content.title.length}字`,
      });
    }

    if (content.body.length > c.maxBodyLength) {
      errors.push({
        field: 'body',
        code: 'TOO_LONG',
        message: `正文不能超过${c.maxBodyLength}字，当前${content.body.length}字`,
      });
    }

    if (content.mediaAssets.length < c.minImages) {
      errors.push({
        field: 'mediaAssets',
        code: 'MISSING_IMAGES',
        message: `至少需要${c.minImages}张图片`,
      });
    }

    return errors;
  }

  abstract convert(content: CanonicalContent): Promise<PlatformContent>;
  abstract preview(content: CanonicalContent): Promise<string>;
}
