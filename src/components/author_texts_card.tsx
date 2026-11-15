import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import type { AuthorText } from '../modules/author_texts_types';
import { authorTextsCompact, authorTextsFeedPath } from '../modules/author_texts_utils';
import { AuthorTextsIcon } from './author_texts_icon';
import { AuthorTextsImage } from './author_texts_image';

export function AuthorTextsCard({ text }: { text: AuthorText }) {
  return (
    <Card as="article" className="author_texts_card">
      <Link to={authorTextsFeedPath(text.author_text_id)} className="author_texts_card_link" aria-label={`Открыть «${text.work_title}»`}>
        <AuthorTextsImage source={text.author_texts_image_url} title={text.work_title} className="author_texts_card_cover" />
        <Card.Body>
          <h2>{text.work_title}</h2>
          <dl className="author_texts_card_metrics">
            <div><dt>Длина</dt><dd title={`${text.text_length?.toLocaleString('ru-RU')} токенов`}>{authorTextsCompact(text.text_length)}</dd></div>
            <div><dt>Уникальных</dt><dd title={`${text.unique_token_count?.toLocaleString('ru-RU')} токенов`}>{authorTextsCompact(text.unique_token_count)}</dd></div>
          </dl>
          <span className="author_texts_card_likes" aria-label={`Отметок нравится: ${text.author_texts_like_count}`}><AuthorTextsIcon name="heart" />{text.author_texts_like_count}</span>
        </Card.Body>
      </Link>
    </Card>
  );
}
