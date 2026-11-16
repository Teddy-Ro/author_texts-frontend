import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthorTextsDispatch, useAuthorTextsSelector } from '../hooks/author_texts_redux';
import { useAuthorTextsRequest } from '../hooks/author_texts_use_request';
import { useAuthorTextsTitle } from '../hooks/author_texts_use_title';
import { authorTextsFetchCard } from '../store/author_texts_thunks';
import { AuthorTextsImage } from '../components/author_texts_image';
import { AuthorTextsAttributes } from '../components/author_texts_attributes';
import { AUTHOR_TEXTS_CORPUS_PATH } from '../modules/author_texts_utils';

export function AuthorTextsDetails() {
  const { author_text_id } = useParams();
  const id = Number(author_text_id);
  const dispatch = useAuthorTextsDispatch();
  const user = useAuthorTextsSelector((state) => state.author_texts_auth.user);
  const load = useCallback((signal: AbortSignal) => {
    if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve({ data: null, source: 'api' as const });
    const request = dispatch(authorTextsFetchCard({ id, allowMock: !user }));
    signal.addEventListener('abort', () => request.abort(), { once: true });
    return request.unwrap();
  }, [id, dispatch, user]);
  const { result, loading, error } = useAuthorTextsRequest(load);
  const text = result?.data;
  useAuthorTextsTitle(text ? `${text.work_title} — подробнее` : 'Подробнее об авторском тексте');
  return <section className="author_texts_details">
    <Link to={AUTHOR_TEXTS_CORPUS_PATH} className="author_texts_details_back" aria-label="Вернуться к списку текстов">←</Link>
    {loading ? <p role="status">Загрузка текста…</p> : error ? <p role="alert">{error}</p> : text ? <>
      <AuthorTextsImage source={text.author_texts_image_url} title={text.work_title} eager />
      <h1>{text.work_title}</h1><p>{text.short_description}</p>
      <dl className="author_texts_details_metrics">
        <div><dt>Длина текста</dt><dd>{text.text_length?.toLocaleString('ru-RU') ?? '—'}</dd></div>
        <div><dt>Уникальных токенов</dt><dd>{text.unique_token_count?.toLocaleString('ru-RU') ?? '—'}</dd></div>
        <div><dt>Лексическое разнообразие</dt><dd>{text.author_texts_ratio?.toLocaleString('ru-RU', { maximumFractionDigits: 4 }) ?? '—'}</dd></div>
      </dl>
      <AuthorTextsAttributes attributes={text.attributes} />
    </> : <h1>Текст не найден</h1>}
  </section>;
}
