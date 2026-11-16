import Nav from 'react-bootstrap/Nav';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AUTHOR_TEXTS_CORPUS_PATH, AUTHOR_TEXTS_FEED_PATH, AUTHOR_TEXTS_ADD_PATH, AUTHOR_TEXTS_LOGIN_PATH } from '../modules/author_texts_utils';
import { AuthorTextsIcon } from './author_texts_icon';
import { authorTextsApi, authorTextsFailure } from '../api/author_texts_client';
import { authorTextsSessionEnded, authorTextsAuthPendingChanged } from '../store/author_texts_actions';
import { useAuthorTextsDispatch, useAuthorTextsSelector } from '../hooks/author_texts_redux';

export function AuthorTextsNavigation() {
  const { pathname } = useLocation();
  const dispatch = useAuthorTextsDispatch();
  const navigate = useNavigate();
  const user = useAuthorTextsSelector((state) => state.author_texts_auth.user);
  const pending = useAuthorTextsSelector((state) => state.author_texts_operations.pending > 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const corpusActive = pathname === AUTHOR_TEXTS_CORPUS_PATH || /^\/author_texts\/\d+$/.test(pathname);
  const logout = async () => {
    setBusy(true); setError('');
    dispatch(authorTextsAuthPendingChanged(true));
    try {
      await authorTextsApi.instance.post('/author_texts_users/logout');
      dispatch(authorTextsSessionEnded());
      navigate(AUTHOR_TEXTS_CORPUS_PATH, { replace: true });
    } catch (failure) { setError(authorTextsFailure(failure).message); }
    finally { dispatch(authorTextsAuthPendingChanged(false)); setBusy(false); }
  };
  return (
    <Nav as="nav" className="author_texts_navigation" aria-label="Основная навигация">
      <Nav.Item>
        <Nav.Link as={NavLink} to={AUTHOR_TEXTS_FEED_PATH} active={pathname.startsWith(AUTHOR_TEXTS_FEED_PATH)} aria-current={pathname.startsWith(AUTHOR_TEXTS_FEED_PATH) ? 'page' : undefined}>
          <AuthorTextsIcon name="feed" /><span>Лента</span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>{user ? <Nav.Link as={NavLink} to={AUTHOR_TEXTS_ADD_PATH} active={pathname === AUTHOR_TEXTS_ADD_PATH}>
        <AuthorTextsIcon name="add" /><span>Добавление</span></Nav.Link> : <Nav.Link as="button" type="button" disabled title="Войдите для добавления текста"><AuthorTextsIcon name="add" /><span>Добавление</span></Nav.Link>}</Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to={AUTHOR_TEXTS_CORPUS_PATH} end active={corpusActive}>
          <AuthorTextsIcon name="corpus" /><span>Корпус</span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>{user ? <Nav.Link as="button" type="button" disabled={busy || pending} onClick={() => void logout()} title={user.username} aria-busy={busy}>
        <AuthorTextsIcon name="login" /><span>{busy ? 'Выход…' : 'Выход'}</span>
      </Nav.Link> : <Nav.Link as={NavLink} to={AUTHOR_TEXTS_LOGIN_PATH} active={pathname === AUTHOR_TEXTS_LOGIN_PATH}>
        <AuthorTextsIcon name="login" /><span>Вход</span></Nav.Link>}</Nav.Item>
      {error && <div className="author_texts_nav_error" role="alert">{error}</div>}
    </Nav>
  );
}
