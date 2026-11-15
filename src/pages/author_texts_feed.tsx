import { Link, useParams } from 'react-router-dom';
import { useAuthorTextsTitle } from '../hooks/author_texts_use_title';
import type { AuthorText } from '../modules/author_texts_types';
import { AUTHOR_TEXTS_CORPUS_PATH, authorTextsCompact, authorTextsFeedPath, authorTextsNext } from '../modules/author_texts_utils';
import { AuthorTextsIcon } from '../components/author_texts_icon';
import { AuthorTextsVideo } from '../components/author_texts_video';

export function AuthorTextsFeed({ texts }: { texts: readonly AuthorText[] }) {
  const { author_text_id } = useParams();
  const id = author_text_id === undefined ? texts[0]?.author_text_id : Number(author_text_id);
  const selected = texts.find((text) => text.author_text_id === id);
  const next = selected ? authorTextsNext(texts, selected.author_text_id) : undefined;
  useAuthorTextsTitle(selected ? `${selected.work_title} — лента авторских текстов` : 'Текст не найден');

  if (!selected) return (
    <section className="author_texts_empty author_texts_feed_empty"><h1>Текст не найден</h1><p>Проверьте адрес или измените фильтр в корпусе.</p><Link to={AUTHOR_TEXTS_CORPUS_PATH} className="btn btn-secondary">В корпус</Link></section>
  );

  return (
    <article className="author_texts_feed" aria-label={selected.work_title}>
      <AuthorTextsVideo key={selected.author_text_id} source={selected.author_texts_video_url} poster={selected.author_texts_image_url} title={selected.work_title} />
      <div className="author_texts_feed_shade" />
      <aside className="author_texts_feed_rail" aria-label="Параметры текста">
        <div className="author_texts_feed_metric author_texts_feed_likes" aria-label={`Отметок нравится: ${selected.author_texts_like_count}`}><AuthorTextsIcon name="heart" /><strong>{selected.author_texts_like_count}</strong></div>
        <div className="author_texts_feed_metric" title={`${selected.unique_token_count?.toLocaleString('ru-RU')} уникальных токенов`}><strong>{authorTextsCompact(selected.unique_token_count)}</strong><span>уник.<br />токенов</span></div>
        <div className="author_texts_feed_metric" title={`${selected.text_length?.toLocaleString('ru-RU')} токенов`}><strong>{authorTextsCompact(selected.text_length)}</strong><span>длина<br />текста</span></div>
        <Link to={authorTextsFeedPath(next?.author_text_id)} className="btn btn-secondary author_texts_feed_next" aria-label="Показать следующий текст"><AuthorTextsIcon name="next" /></Link>
      </aside>
      <div className="author_texts_feed_copy"><h1>{selected.work_title}</h1><p>{selected.short_description}</p></div>
    </article>
  );
}
