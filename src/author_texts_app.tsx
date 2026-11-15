import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthorTextsNavigation } from './components/author_texts_navigation';
import { AUTHOR_TEXTS_MOCK } from './modules/author_texts_mock';
import { AUTHOR_TEXTS_CORPUS_PATH, AUTHOR_TEXTS_FEED_PATH, authorTextsFilter } from './modules/author_texts_utils';
import { AuthorTextsCorpus } from './pages/author_texts_corpus';
import { AuthorTextsFeed } from './pages/author_texts_feed';

const AUTHOR_TEXTS_MAXIMUM = Math.ceil(Math.max(...AUTHOR_TEXTS_MOCK.map((text) => text.text_length ?? 0)) / 100_000) * 100_000;

export function AuthorTextsApp() {
  const [minimum, setMinimum] = useState(0);
  const [appliedMinimum, setAppliedMinimum] = useState(0);
  const texts = authorTextsFilter(AUTHOR_TEXTS_MOCK, appliedMinimum);
  const { pathname } = useLocation();
  const isFeed = pathname.startsWith(AUTHOR_TEXTS_FEED_PATH);
  const resetFilter = () => { setMinimum(0); setAppliedMinimum(0); };

  return (
    <div className={`author_texts_app${isFeed ? ' author_texts_app_feed' : ''}`}>
      <main className="author_texts_main">
        <Routes>
          <Route path={AUTHOR_TEXTS_CORPUS_PATH} element={
            <AuthorTextsCorpus
              texts={texts}
              minimum={minimum}
              appliedMinimum={appliedMinimum}
              maximum={AUTHOR_TEXTS_MAXIMUM}
              onChange={setMinimum}
              onApply={() => setAppliedMinimum(minimum)}
              onReset={resetFilter}
            />
          } />
          <Route path={AUTHOR_TEXTS_FEED_PATH} element={<AuthorTextsFeed texts={texts} />} />
          <Route path={`${AUTHOR_TEXTS_FEED_PATH}/:author_text_id`} element={<AuthorTextsFeed texts={texts} />} />
          <Route path="*" element={<Navigate to={AUTHOR_TEXTS_CORPUS_PATH} replace />} />
        </Routes>
      </main>
      <AuthorTextsNavigation firstId={texts[0]?.author_text_id} />
    </div>
  );
}
