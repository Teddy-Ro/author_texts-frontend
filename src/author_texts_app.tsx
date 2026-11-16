import { useCallback } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthorTextsNavigation } from './components/author_texts_navigation';
import { useAuthorTextsRequest } from './hooks/author_texts_use_request';
import { AUTHOR_TEXTS_CORPUS_PATH, AUTHOR_TEXTS_FEED_PATH, AUTHOR_TEXTS_ADD_PATH, AUTHOR_TEXTS_LOGIN_PATH } from './modules/author_texts_utils';
import { AuthorTextsCorpus } from './pages/author_texts_corpus';
import { AuthorTextsFeed } from './pages/author_texts_feed';
import { AuthorTextsLogin } from './pages/author_texts_login';
import { AuthorTextsAdd } from './pages/author_texts_add';
import { AuthorTextsDetails } from './pages/author_texts_details';
import { useAuthorTextsDispatch, useAuthorTextsSelector } from './hooks/author_texts_redux';
import { authorTextsFetchList } from './store/author_texts_thunks';
import { authorTextsMinimumChanged, authorTextsFilterApplied, authorTextsFilterReset, authorTextsErrorCleared } from './store/author_texts_store';

export function AuthorTextsApp() {
  const dispatch = useAuthorTextsDispatch();
  const { minimum, appliedMinimum } = useAuthorTextsSelector((state) => state.author_texts_filter);
  const user = useAuthorTextsSelector((state) => state.author_texts_auth.user);
  const authPending = useAuthorTextsSelector((state) => state.author_texts_auth.pending);
  const { pending, revision, error: operationError } = useAuthorTextsSelector((state) => state.author_texts_operations);
  const load = useCallback((signal: AbortSignal) => {
    const request = dispatch(authorTextsFetchList({ minimum: appliedMinimum, allowMock: !user }));
    signal.addEventListener('abort', () => request.abort(), { once: true });
    return request.unwrap();
  }, [appliedMinimum, user, revision, dispatch]);
  const { result, loading, error } = useAuthorTextsRequest(load);
  const texts = result?.data ?? [];
  const maximum = Math.max(600_000, minimum, ...texts.map((text) => Math.ceil((text.text_length ?? 0) / 100_000) * 100_000));
  const { pathname } = useLocation();
  const isFeed = pathname.startsWith(AUTHOR_TEXTS_FEED_PATH);
  const resetFilter = () => { dispatch(authorTextsFilterReset()); };
  const definitions = [...new Map(texts.flatMap((text) => text.attributes).map((item) => [item.author_texts_attribute_id, item])).values()];

  return (
    <div className={`author_texts_app${isFeed ? ' author_texts_app_feed' : ''}`}>
      <main className="author_texts_main">
        {operationError && <div className="author_texts_operation_error" role="alert">{operationError}
          <button type="button" onClick={() => dispatch(authorTextsErrorCleared())} aria-label="Закрыть сообщение">×</button>
        </div>}
        <Routes>
          <Route path={AUTHOR_TEXTS_CORPUS_PATH} element={
            <AuthorTextsCorpus
              texts={texts}
              minimum={minimum}
              appliedMinimum={appliedMinimum}
              maximum={maximum}
              loading={loading}
              error={error}
              source={result?.source}
              onChange={(value) => dispatch(authorTextsMinimumChanged(value))}
              onApply={() => dispatch(authorTextsFilterApplied())}
              onReset={resetFilter}
            />
          } />
          <Route path={AUTHOR_TEXTS_FEED_PATH} element={<AuthorTextsFeed texts={texts} minimum={appliedMinimum} listLoading={loading} />} />
          <Route path={`${AUTHOR_TEXTS_FEED_PATH}/:author_text_id`} element={<AuthorTextsFeed texts={texts} minimum={appliedMinimum} listLoading={loading} />} />
          <Route path={AUTHOR_TEXTS_LOGIN_PATH} element={<AuthorTextsLogin />} />
          <Route path={AUTHOR_TEXTS_ADD_PATH} element={<AuthorTextsAdd definitions={definitions} />} />
          <Route path="/author_texts/:author_text_id" element={<AuthorTextsDetails />} />
          <Route path="*" element={<Navigate to={AUTHOR_TEXTS_CORPUS_PATH} replace />} />
        </Routes>
      </main>
      <AuthorTextsNavigation />
      {(pending > 0 || authPending) && <div className="author_texts_busy" role="status"><Spinner animation="border" size="sm" /><span>Выполняется запрос…</span></div>}
    </div>
  );
}
