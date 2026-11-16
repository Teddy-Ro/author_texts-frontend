import type { AuthorText } from './author_texts_types';

export const AUTHOR_TEXTS_CORPUS_PATH = '/author_texts';
export const AUTHOR_TEXTS_FEED_PATH = '/author_texts/feed';
export const AUTHOR_TEXTS_ADD_PATH = '/author_texts/add';
export const AUTHOR_TEXTS_LOGIN_PATH = '/author_texts/login';
export const AUTHOR_TEXTS_DEFAULT_IMAGE = `${import.meta.env.BASE_URL}media/author_texts_default.jpg`;
export const AUTHOR_TEXTS_DEFAULT_VIDEO = `${import.meta.env.BASE_URL}media/author_texts_default.webm`;

export function authorTextsDetailsPath(id: number): string { return `/author_texts/${id}`; }

export function authorTextsMediaPath(source: string): string {
  return source.replace(/^https?:\/\/[^/]+\/author-texts-media\//, '/author_texts_media/');
}

export function authorTextsFeedPath(id?: number): string {
  return id === undefined ? AUTHOR_TEXTS_FEED_PATH : `${AUTHOR_TEXTS_FEED_PATH}/${id}`;
}

export function authorTextsFilter(texts: readonly AuthorText[], minimum: number): AuthorText[] {
  return texts.filter((text) => (text.text_length ?? 0) >= minimum);
}

export function authorTextsNext(texts: readonly AuthorText[], id: number): AuthorText | undefined {
  const index = texts.findIndex((text) => text.author_text_id === id);
  return index < 0 ? undefined : texts[(index + 1) % texts.length];
}

export function authorTextsCompact(value: number | null): string {
  if (value === null) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })}м`;
  if (value >= 1_000) return `${(value / 1_000).toLocaleString('ru-RU', { maximumFractionDigits: value >= 100_000 ? 0 : 1 })}к`;
  return value.toLocaleString('ru-RU');
}

export function authorTextsCountLabel(count: number): string {
  const last = count % 10;
  const lastTwo = count % 100;
  if (last === 1 && lastTwo !== 11) return `${count} текст`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${count} текста`;
  return `${count} текстов`;
}
