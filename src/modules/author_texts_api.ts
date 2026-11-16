import { AUTHOR_TEXTS_MOCK } from './author_texts_mock';
import type { AuthorText } from './author_texts_types';
import { authorTextsFilter, authorTextsNext } from './author_texts_utils';
import { authorTextsApi, authorTextsFailure } from '../api/author_texts_client';

export type AuthorTextsSource = 'api' | 'mock';
export interface AuthorTextsResult<T> { data: T; source: AuthorTextsSource }

// Validate the JSON boundary instead of treating any successful response as a card.
function isAuthorText(value: unknown): value is AuthorText {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return Number.isSafeInteger(row.author_text_id) && Number(row.author_text_id) > 0
    && typeof row.work_title === 'string'
    && ['short_description', 'author_texts_image_url', 'author_texts_video_url'].every((key) => row[key] === null || typeof row[key] === 'string')
    && ['text_length', 'unique_token_count', 'author_texts_ratio'].every((key) => row[key] === null || (typeof row[key] === 'number' && Number.isFinite(row[key])))
    && Number.isSafeInteger(row.author_texts_like_count) && Number(row.author_texts_like_count) >= 0
    && (row.is_owner === 0 || row.is_owner === 1) && (row.is_liked === 0 || row.is_liked === 1)
    && Array.isArray(row.attributes) && row.attributes.every((attribute: unknown) => {
      if (typeof attribute !== 'object' || attribute === null) return false;
      const item = attribute as Record<string, unknown>;
      return Number.isSafeInteger(item.author_texts_attribute_id)
        && typeof item.attribute_name === 'string' && typeof item.attribute_value === 'string';
    });
}

async function request<T>(load: () => Promise<unknown>, validate: (data: unknown) => data is T, fallback: () => T, signal: AbortSignal, allowMock: boolean): Promise<AuthorTextsResult<T>> {
  if (allowMock && import.meta.env.VITE_AUTHOR_TEXTS_DATA_MODE === 'mock') return { data: fallback(), source: 'mock' };
  try {
    const data = await load();
    if (!validate(data)) throw new Error('Unexpected author_texts response');
    return { data, source: 'api' };
  } catch (error) {
    if (signal.aborted || !allowMock) throw error;
    // A missing/deleted card or a permission error must never become a mock card.
    const { status } = authorTextsFailure(error);
    if (status !== null && status < 500) throw error;
    return { data: fallback(), source: 'mock' };
  }
}

export function authorTextsList(minimum: number, signal: AbortSignal, allowMock = true) {
  return request(() => authorTextsApi.authorTexts.listAuthorTextsAuthorTextsGet({ min_text_length: minimum }, { signal }),
    (data): data is AuthorText[] => Array.isArray(data) && data.every(isAuthorText),
    () => authorTextsFilter(AUTHOR_TEXTS_MOCK, minimum), signal, allowMock);
}

export async function authorTextsDetail(id: number | undefined, signal: AbortSignal, allowMock = true): Promise<AuthorTextsResult<AuthorText | null>> {
  try {
    return await request<AuthorText | null>(() => authorTextsApi.authorTexts.getAuthorTextsFeedAuthorTextsFeedGet(id === undefined ? undefined : { author_text_id: id }, { signal }), isAuthorText,
      () => AUTHOR_TEXTS_MOCK.find((text) => id === undefined || text.author_text_id === id) ?? null, signal, allowMock);
  } catch (error) {
    if (authorTextsFailure(error).status === 404) return { data: null, source: 'api' };
    throw error;
  }
}

export async function authorTextsNextCard(id: number, signal: AbortSignal, allowMock = true): Promise<AuthorTextsResult<AuthorText | null>> {
  try {
    return await request<AuthorText | null>(() => authorTextsApi.authorTexts.getAuthorTextsFeedAuthorTextsFeedGet({ author_text_id: id, next: true }, { signal }), isAuthorText,
      () => authorTextsNext(AUTHOR_TEXTS_MOCK, id) ?? null, signal, allowMock);
  } catch (error) {
    if (authorTextsFailure(error).status === 404) return { data: null, source: 'api' };
    throw error;
  }
}
