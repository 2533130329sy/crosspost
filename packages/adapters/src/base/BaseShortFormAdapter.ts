import type { CanonicalContent, IPlatformAdapter, ValidationError } from '@crosspost/shared';
import { ContentFlow } from '@crosspost/shared';
import type { Platform, PlatformConstraints } from '@crosspost/shared';
import type { PlatformContent } from '@crosspost/shared';

export abstract class BaseShortFormAdapter implements IPlatformAdapter {
  abstract readonly platform: Platform;
  abstract readonly displayName: string;
  abstract readonly constraints: PlatformConstraints;

  get contentFlow(): ContentFlow {
    return ContentFlow.SHORT_FORM;
  }

  /** Convert GFM markdown to plain text, stripping all formatting */
  protected markdownToPlainText(md: string): string {
    let text = md;

    // Remove LaTeX blocks
    text = text.replace(/\$\$[\s\S]*?\$\$/g, '[公式]');
    text = text.replace(/\$[^$]+\$/g, '[公式]');

    // Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '[代码块]');
    text = text.replace(/`([^`]+)`/g, '$1');

    // Remove images but note them
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_m, alt) => alt ? `[图: ${alt}]` : '[图片]');

    // Convert links to plain text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove cross-references like "如图X所示"
    text = text.replace(/如图\s*\d+\s*所示[，,。.]?/g, '');
    text = text.replace(/见上图[，,。.]?/g, '');
    text = text.replace(/如下图所示[，,。.]?/g, '');

    // Strip remaining markdown syntax
    text = text.replace(/^#{1,6}\s+/gm, ''); // headings
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2'); // bold
    text = text.replace(/(\*|_)(.*?)\1/g, '$2'); // italic
    text = text.replace(/~~(.*?)~~/g, '$1'); // strikethrough
    text = text.replace(/^>\s?/gm, ''); // blockquotes
    text = text.replace(/^\s*[-*+]\s+/gm, '· '); // unordered lists
    text = text.replace(/^\s*\d+\.\s+/gm, ''); // ordered lists
    text = text.replace(/---+/g, ''); // horizontal rules

    // Normalize whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/ {2,}/g, ' ');
    text = text.trim();

    return text;
  }

  /** Grapheme-aware length count using Intl.Segmenter */
  protected graphemeLength(text: string): number {
    const segmenter = new Intl.Segmenter('zh-Hans', { granularity: 'grapheme' });
    return [...segmenter.segment(text)].length;
  }

  /** Grapheme-aware truncation */
  protected truncate(text: string, maxChars: number): { text: string; truncated: boolean } {
    const segmenter = new Intl.Segmenter('zh-Hans', { granularity: 'grapheme' });
    const segments = [...segmenter.segment(text)];

    if (segments.length <= maxChars) {
      return { text, truncated: false };
    }

    const truncated = segments.slice(0, maxChars).map((s) => s.segment).join('');

    // Clean up any broken markdown at the truncation point
    const cleaned = truncated
      .replace(/[*_~`#]{1,2}$/, '') // remove partial formatting
      .replace(/\[[^\]]*$/, '') // remove partial links
      .trim();

    return { text: cleaned + '…', truncated: true };
  }

  /** Extract hashtags from text */
  protected extractTags(text: string): string[] {
    const matches = text.match(/#[\w一-鿿]+/g);
    if (!matches) return [];
    return [...new Set(matches.map((t) => t.replace(/^#/, '')))];
  }

  /** Base validation: check title, body length, and media requirements */
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

    const bodyLen = this.graphemeLength(content.body);
    if (bodyLen > c.maxBodyLength) {
      errors.push({
        field: 'body',
        code: 'TOO_LONG',
        message: `正文不能超过${c.maxBodyLength}字，当前${bodyLen}字`,
      });
    }

    if (content.mediaAssets.length < c.minImages) {
      errors.push({
        field: 'mediaAssets',
        code: 'MISSING_IMAGES',
        message: `至少需要${c.minImages}张图片，当前${content.mediaAssets.length}张`,
      });
    }

    return errors;
  }

  abstract convert(content: CanonicalContent): Promise<PlatformContent>;
  abstract preview(content: CanonicalContent): Promise<string>;
}
