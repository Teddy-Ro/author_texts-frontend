import type { AuthorText } from '../modules/author_texts_types';
import { authorTextsCountLabel } from '../modules/author_texts_utils';
import { useAuthorTextsTitle } from '../hooks/author_texts_use_title';
import { AuthorTextsCard } from '../components/author_texts_card';
import { AuthorTextsFilter } from '../components/author_texts_filter';

interface AuthorTextsCorpusProps {
  texts: readonly AuthorText[];
  minimum: number;
  appliedMinimum: number;
  maximum: number;
  onChange: (value: number) => void;
  onApply: () => void;
  onReset: () => void;
}

export function AuthorTextsCorpus({ texts, minimum, appliedMinimum, maximum, onChange, onApply, onReset }: AuthorTextsCorpusProps) {
  useAuthorTextsTitle('Корпус авторских текстов');
  return (
    <section className="author_texts_corpus">
      <header className="author_texts_corpus_heading"><h1>Корпус текстов</h1><p>Сравните длину и словарный состав произведений.</p></header>
      <AuthorTextsFilter
        value={minimum}
        maximum={maximum}
        onChange={onChange}
        onApply={onApply}
        onReset={onReset}
      />
      <div className="author_texts_results" aria-live="polite"><span>{authorTextsCountLabel(texts.length)}</span>{appliedMinimum > 0 && <span>от {appliedMinimum.toLocaleString('ru-RU')} токенов</span>}</div>
      {texts.length ? (
        <div className="author_texts_grid" aria-label="Авторские тексты">{texts.map((text) => <AuthorTextsCard key={text.author_text_id} text={text} />)}</div>
      ) : (
        <div className="author_texts_empty" role="status"><h2>Тексты не найдены</h2><p>Уменьшите минимальную длину текста или сбросьте фильтр.</p></div>
      )}
    </section>
  );
}
