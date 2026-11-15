import { AUTHOR_TEXTS_MOCK } from '../modules/author_texts_mock';
import { authorTextsCompact, authorTextsCountLabel, authorTextsFeedPath, authorTextsFilter, authorTextsNext } from '../modules/author_texts_utils';

describe('Тематические данные и навигация', () => {
  it('содержит уникальные ID и согласованные количества токенов', () => {
    expect(new Set(AUTHOR_TEXTS_MOCK.map((text) => text.author_text_id)).size).toBe(AUTHOR_TEXTS_MOCK.length);
    for (const text of AUTHOR_TEXTS_MOCK) {
      expect(text.unique_token_count).toBeLessThanOrEqual(text.text_length!);
      expect(text.author_texts_ratio).toBeCloseTo(text.unique_token_count! / text.text_length!);
      expect(text.is_owner).toBe(0);
      expect(text.is_liked).toBe(0);
    }
  });

  it('фильтрует по общему количеству токенов, не по уникальным', () => {
    expect(authorTextsFilter(AUTHOR_TEXTS_MOCK, 100000).map((text) => text.author_text_id)).toEqual([1, 4]);
    expect(authorTextsFilter(AUTHOR_TEXTS_MOCK, 0)).toHaveLength(6);
    expect(authorTextsFilter(AUTHOR_TEXTS_MOCK, 600000)).toEqual([]);
  });

  it('включает граничное значение фильтра', () => {
    expect(authorTextsFilter(AUTHOR_TEXTS_MOCK, 587287).map((text) => text.author_text_id)).toEqual([1]);
  });

  it('переходит к следующей карточке и замыкает цикл', () => {
    expect(authorTextsNext(AUTHOR_TEXTS_MOCK, 1)?.author_text_id).toBe(2);
    expect(authorTextsNext(AUTHOR_TEXTS_MOCK, 6)?.author_text_id).toBe(1);
    expect(authorTextsNext([], 1)).toBeUndefined();
    expect(authorTextsNext(AUTHOR_TEXTS_MOCK, 999)).toBeUndefined();
  });

  it('работает с отфильтрованной и единственной карточкой', () => {
    const filtered = authorTextsFilter(AUTHOR_TEXTS_MOCK, 100000);
    expect(authorTextsNext(filtered, 1)?.author_text_id).toBe(4);
    expect(authorTextsNext(filtered, 4)?.author_text_id).toBe(1);
    expect(authorTextsNext(filtered.slice(0, 1), 1)?.author_text_id).toBe(1);
  });

  it.each([[null, '—'], [8, '8'], [18210, '18,2к'], [587287, '587к'], [1500000, '1,5м']] as const)('сокращает %s до %s', (input, expected) => {
    expect(authorTextsCompact(input)).toBe(expected);
  });

  it.each([[0, '0 текстов'], [1, '1 текст'], [2, '2 текста'], [11, '11 текстов'], [21, '21 текст'], [24, '24 текста']] as const)('склоняет число %s', (input, expected) => {
    expect(authorTextsCountLabel(input)).toBe(expected);
  });

  it('строит тематические адреса ленты', () => {
    expect(authorTextsFeedPath()).toBe('/author_texts/feed');
    expect(authorTextsFeedPath(4)).toBe('/author_texts/feed/4');
  });
});
