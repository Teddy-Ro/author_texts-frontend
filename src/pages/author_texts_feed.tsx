import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthorTextsTitle } from '../hooks/author_texts_use_title';
import type { AuthorText } from '../modules/author_texts_types';
import { AUTHOR_TEXTS_CORPUS_PATH, authorTextsCompact, authorTextsFeedPath, authorTextsNext } from '../modules/author_texts_utils';
import { AuthorTextsIcon } from '../components/author_texts_icon';
import { AuthorTextsVideo } from '../components/author_texts_video';
import { useAuthorTextsRequest } from '../hooks/author_texts_use_request';
import { useAuthorTextsDispatch, useAuthorTextsSelector } from '../hooks/author_texts_redux';
import { authorTextsFetchCard, authorTextsFetchNext, authorTextsLike } from '../store/author_texts_thunks';

export function AuthorTextsFeed({ texts, minimum, listLoading }: { texts: readonly AuthorText[]; minimum: number; listLoading: boolean }) {
  const { author_text_id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAuthorTextsDispatch();
  const user = useAuthorTextsSelector((state) => state.author_texts_auth.user);
  const busy = useAuthorTextsSelector((state) => state.author_texts_operations.pending > 0);
  const id = author_text_id === undefined ? (minimum > 0 ? texts[0]?.author_text_id : undefined) : Number(author_text_id);
  const invalid = id !== undefined && (!Number.isSafeInteger(id) || id < 1);
  const load = useCallback((signal: AbortSignal) => {
    if (invalid) return Promise.resolve({ data: null, source: 'api' as const });
    const request = dispatch(authorTextsFetchCard({ id, allowMock: !user }));
    signal.addEventListener('abort', () => request.abort(), { once: true });
    return request.unwrap();
  }, [id, invalid, user, dispatch]);
  const { result, loading, error, replace } = useAuthorTextsRequest(load);
  const selected = result?.data && (minimum === 0 || texts.some((text) => text.author_text_id === result.data?.author_text_id)) ? result.data : null;
  const next = selected ? authorTextsNext(texts, selected.author_text_id) : undefined;
  const [nextLoading, setNextLoading] = useState(false);
  const [nextError, setNextError] = useState<string | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const nextController = useRef<AbortController | null>(null);
  useEffect(() => {
    setNextLoading(false);
    setNextError(null);
    setDescriptionExpanded(false);
    return () => nextController.current?.abort();
  }, [id]);
  const showNext = async () => {
    if (!selected) return;
    setNextLoading(true);
    setNextError(null);
    const controller = new AbortController();
    nextController.current = controller;
    try {
      const request = minimum > 0 && next
        ? dispatch(authorTextsFetchCard({ id: next.author_text_id, allowMock: !user }))
        : dispatch(authorTextsFetchNext({ id: selected.author_text_id, allowMock: !user }));
      controller.signal.addEventListener('abort', () => request.abort(), { once: true });
      const response = await request.unwrap();
      if (!controller.signal.aborted) {
        if (response.data) navigate(authorTextsFeedPath(response.data.author_text_id));
        else setNextError('Следующий текст не найден.');
      }
    } catch {
      if (!controller.signal.aborted) setNextError('Не удалось открыть следующий текст.');
    } finally {
      if (!controller.signal.aborted) setNextLoading(false);
    }
  };
  const toggleLike = async () => {
    if (!selected || !user || result?.source !== 'api') return;
    try {
      const text = await dispatch(authorTextsLike({ id: selected.author_text_id, value: selected.is_liked === 1 ? 0 : 1 })).unwrap();
      replace({ data: text, source: 'api' });
    } catch { /* The Redux operation error is shown by the application. */ }
  };
  useAuthorTextsTitle(selected ? `${selected.work_title} — лента авторских текстов` : 'Текст не найден');

  if (loading || (minimum > 0 && listLoading)) return <section className="author_texts_empty author_texts_feed_empty" role="status">Загрузка текста…</section>;
  if (error) return <section className="author_texts_empty author_texts_feed_empty" role="alert">{error}</section>;
  if (!selected) return (
    <section className="author_texts_empty author_texts_feed_empty"><h1>Текст не найден</h1><p>Проверьте адрес или измените фильтр в корпусе.</p><Link to={AUTHOR_TEXTS_CORPUS_PATH} className="btn btn-secondary">В корпус</Link></section>
  );

  return (
    <article className="author_texts_feed" aria-label={selected.work_title}>
      <AuthorTextsVideo key={selected.author_text_id} source={selected.author_texts_video_url} poster={selected.author_texts_image_url} title={selected.work_title} />
      <div className="author_texts_feed_shade" />
      <aside className="author_texts_feed_rail" aria-label="Параметры текста">
        {user && result?.source === 'api' ? <button type="button" disabled={busy} onClick={() => void toggleLike()} aria-pressed={selected.is_liked === 1}
          className="author_texts_feed_metric author_texts_feed_likes" aria-label={selected.is_liked === 1 ? 'Снять лайк' : 'Поставить лайк'}>
          <AuthorTextsIcon name="heart" /><strong>{selected.author_texts_like_count}</strong>
        </button> : <div className="author_texts_feed_metric author_texts_feed_likes" aria-label={`Отметок нравится: ${selected.author_texts_like_count}`}><AuthorTextsIcon name="heart" /><strong>{selected.author_texts_like_count}</strong></div>}
        <div className="author_texts_feed_metric" title={`${selected.unique_token_count?.toLocaleString('ru-RU')} уникальных токенов`}><strong>{authorTextsCompact(selected.unique_token_count)}</strong><span>уник.<br />токенов</span></div>
        <div className="author_texts_feed_metric" title={`${selected.text_length?.toLocaleString('ru-RU')} токенов`}><strong>{authorTextsCompact(selected.text_length)}</strong><span>длина<br />текста</span></div>
        <button type="button" disabled={nextLoading || busy} onClick={showNext} className="btn btn-secondary author_texts_feed_next" aria-label="Показать следующий текст"><AuthorTextsIcon name="next" /></button>
      </aside>
      <div className="author_texts_feed_copy">
        <h1>{selected.work_title}</h1>
        {selected.short_description && <>
          <p id="author_texts_feed_description" className={descriptionExpanded ? 'author_texts_description_expanded' : undefined}>{selected.short_description}</p>
          {selected.short_description.length > 100 && <button type="button" className="author_texts_description_toggle"
            aria-expanded={descriptionExpanded} aria-controls="author_texts_feed_description" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
            {descriptionExpanded ? 'Меньше' : 'Больше'}
          </button>}
        </>}
        {nextError && <p role="alert">{nextError}</p>}
      </div>
    </article>
  );
}
