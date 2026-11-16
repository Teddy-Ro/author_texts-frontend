import { useEffect, useRef, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Navigate, useNavigate } from 'react-router-dom';
import { authorTextsApi, authorTextsFailure } from '../api/author_texts_client';
import type { AuthorTextsUserResponse } from '../api/author_texts_api.generated';
import { useAuthorTextsDispatch, useAuthorTextsSelector } from '../hooks/author_texts_redux';
import { useAuthorTextsTitle } from '../hooks/author_texts_use_title';
import { authorTextsSignedIn, authorTextsAuthPendingChanged } from '../store/author_texts_actions';
import { AUTHOR_TEXTS_CORPUS_PATH } from '../modules/author_texts_utils';

export function AuthorTextsLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const dispatch = useAuthorTextsDispatch();
  const navigate = useNavigate();
  const user = useAuthorTextsSelector((state) => state.author_texts_auth.user);
  useAuthorTextsTitle(register ? 'Регистрация' : 'Вход');
  useEffect(() => () => { controller.current?.abort(); dispatch(authorTextsAuthPendingChanged(false)); }, [dispatch]);
  if (user) return <Navigate to={AUTHOR_TEXTS_CORPUS_PATH} replace />;

  const submit = async () => {
    const request = new AbortController();
    controller.current = request;
    setBusy(true); setError('');
    dispatch(authorTextsAuthPendingChanged(true));
    const fields = { username: username.trim(), password };
    let created = false;
    let existing = false;
    try {
      // Authentication is deliberately manual Axios, without codegen or thunk.
      if (register) {
        try {
          await authorTextsApi.instance.post('/author_texts_users/register', fields, { signal: request.signal });
          created = true;
        } catch (failure) {
          if (authorTextsFailure(failure).status !== 409) throw failure;
          existing = true;
        }
      }
      const response = await authorTextsApi.instance.post<AuthorTextsUserResponse>('/author_texts_users/login', fields, { signal: request.signal });
      if (!request.signal.aborted) {
        dispatch(authorTextsSignedIn(response.data));
        setPassword('');
        navigate(AUTHOR_TEXTS_CORPUS_PATH, { replace: true });
      }
    } catch (failure) {
      if (!request.signal.aborted) {
        if (created || existing) setRegister(false);
        const reason = authorTextsFailure(failure);
        setError(existing && reason.status === 401
          ? 'Аккаунт с таким именем уже существует. Введите его пароль для входа.'
          : `${created ? 'Аккаунт создан. Повторите вход. ' : ''}${reason.message}`);
      }
    } finally {
      dispatch(authorTextsAuthPendingChanged(false));
      if (!request.signal.aborted) setBusy(false);
    }
  };
  return <section className="author_texts_form_page">
    <h1>{register ? 'Регистрация' : 'Вход'}</h1>
    <Form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <fieldset disabled={busy}>
        <Form.Group controlId="author_texts_username"><Form.Label>Имя пользователя</Form.Label>
          <Form.Control autoComplete="username" required maxLength={80} value={username} onChange={(event) => setUsername(event.target.value)} />
        </Form.Group>
        <Form.Group controlId="author_texts_password"><Form.Label>Пароль</Form.Label>
          <Form.Control type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
        </Form.Group>
        <Button type="submit" variant="secondary">{busy ? (register ? 'Создаём аккаунт и входим…' : 'Входим…') : register ? 'Создать аккаунт и войти' : 'Войти'}</Button>
        <Button type="button" variant="link" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Уже есть аккаунт' : 'Зарегистрироваться'}</Button>
      </fieldset>
    </Form>
    {busy && <p role="status">Выполняется вход…</p>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
