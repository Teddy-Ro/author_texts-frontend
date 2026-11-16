import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockAuthorTextsApi, renderAuthorTextsApp } from './author_texts_helpers';
import { AUTHOR_TEXTS_MOCK } from '../modules/author_texts_mock';
import { createAuthorTextsStore, authorTextsMinimumChanged, authorTextsFilterApplied } from '../store/author_texts_store';
import { authorTextsSignedIn } from '../store/author_texts_actions';
import { authorTextsLike, authorTextsLoadDraft } from '../store/author_texts_thunks';

const account = { author_texts_user_id: 77, username: 'author_texts_test' };
const owned = { ...AUTHOR_TEXTS_MOCK[0], is_owner: 1 };
beforeEach(() => vi.stubEnv('VITE_AUTHOR_TEXTS_DATA_MODE', 'auto'));

it.each([201, 409])('кнопка создания аккаунта выполняет вход после ответа регистрации %s', async (registrationStatus) => {
  const adapter = mockAuthorTextsApi((config) => {
    if (config.url?.endsWith('/register')) return { data: registrationStatus === 201 ? account : '', status: registrationStatus };
    if (config.url?.endsWith('/login')) return { data: account };
    return { data: [owned] };
  });
  const { store } = renderAuthorTextsApp('/author_texts/login');
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
  await user.type(screen.getByLabelText('Имя пользователя'), account.username);
  await user.type(screen.getByLabelText('Пароль'), 'test_password');
  await user.click(screen.getByRole('button', { name: 'Создать аккаунт и войти' }));
  await screen.findByRole('button', { name: 'Выход' });
  expect(store.getState().author_texts_auth).toEqual({ user: account, pending: false });
  expect(screen.getByRole('link', { name: 'Добавление' })).toBeInTheDocument();
  const authRequests = adapter.mock.calls.filter(([config]) => config.url?.startsWith('/author_texts_users/'));
  expect(authRequests.map(([config]) => config.url)).toEqual(['/author_texts_users/register', '/author_texts_users/login']);
  expect(JSON.parse(authRequests[1][0].data)).toEqual(JSON.parse(authRequests[0][0].data));
});

it('при занятом имени и неверном пароле не выполняет вход и предлагает пароль существующего аккаунта', async () => {
  mockAuthorTextsApi((config) => {
    if (config.url?.endsWith('/register')) return { data: '', status: 409 };
    if (config.url?.endsWith('/login')) return { data: '', status: 401 };
    return { data: [owned] };
  });
  const { store } = renderAuthorTextsApp('/author_texts/login');
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
  await user.type(screen.getByLabelText('Имя пользователя'), account.username);
  await user.type(screen.getByLabelText('Пароль'), 'wrong_password');
  await user.click(screen.getByRole('button', { name: 'Создать аккаунт и войти' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Введите его пароль');
  expect(store.getState().author_texts_auth.user).toBeNull();
  expect(screen.getByRole('button', { name: 'Войти' })).toBeEnabled();
});

it('показывает ошибку входа, затем авторизует через ручной Axios и открывает добавление', async () => {
  let accepted = false;
  const adapter = mockAuthorTextsApi((config) => config.url?.endsWith('/login')
    ? { data: accepted ? account : '', status: accepted ? 200 : 401 } : { data: [owned] });
  const { store } = renderAuthorTextsApp('/author_texts/login');
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Имя пользователя'), account.username);
  await user.type(screen.getByLabelText('Пароль'), 'test_password');
  await user.click(screen.getByRole('button', { name: 'Войти' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Нужен вход');
  expect(store.getState().author_texts_auth.user).toBeNull();
  accepted = true;
  await user.click(screen.getByRole('button', { name: 'Войти' }));
  await screen.findByRole('button', { name: 'Выход' });
  expect(screen.getByRole('link', { name: 'Добавление' })).toHaveAttribute('href', '/author_texts/add');
  expect(store.getState().author_texts_auth.user).toEqual(account);
  const request = adapter.mock.calls.find(([config]) => config.url?.endsWith('/login'))?.[0];
  expect(request?.withCredentials).toBe(true);
  expect(JSON.parse(request?.data)).toEqual({ username: account.username, password: 'test_password' });
});

it('не регистрирует повторно аккаунт, если регистрация прошла, а первый вход завершился ошибкой', async () => {
  let loginAttempts = 0;
  const adapter = mockAuthorTextsApi((config) => {
    if (config.url?.endsWith('/register')) return { data: account, status: 201 };
    if (config.url?.endsWith('/login')) return { data: ++loginAttempts === 1 ? '' : account, status: loginAttempts === 1 ? 503 : 200 };
    return { data: [owned] };
  });
  renderAuthorTextsApp('/author_texts/login');
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));
  await user.type(screen.getByLabelText('Имя пользователя'), account.username);
  await user.type(screen.getByLabelText('Пароль'), 'test_password');
  await user.click(screen.getByRole('button', { name: 'Создать аккаунт и войти' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Аккаунт создан');
  await user.click(screen.getByRole('button', { name: 'Войти' }));
  await screen.findByRole('button', { name: 'Выход' });
  expect(adapter.mock.calls.filter(([config]) => config.url?.endsWith('/register'))).toHaveLength(1);
});

it('при выходе очищает Redux-пользователя, фильтр и черновик', async () => {
  const store = createAuthorTextsStore();
  store.dispatch(authorTextsSignedIn(account));
  store.dispatch(authorTextsMinimumChanged(100000));
  store.dispatch(authorTextsFilterApplied());
  mockAuthorTextsApi((config) => ({ data: config.url?.endsWith('/draft') ? owned : config.method === 'post' ? '' : [owned] }));
  await store.dispatch(authorTextsLoadDraft()).unwrap();
  renderAuthorTextsApp('/author_texts', store);
  const user = userEvent.setup();
  await screen.findByRole('heading', { name: owned.work_title });
  await user.click(screen.getByRole('button', { name: 'Выход' }));
  await screen.findByRole('link', { name: 'Вход' });
  const state = store.getState();
  expect(state.author_texts_auth.user).toBeNull();
  expect(state.author_texts_filter).toEqual({ minimum: 0, appliedMinimum: 0 });
  expect(state.author_texts_operations.draft).toBeNull();
});

it('ошибка записи не подменяется mock, а 401 сбрасывает интерфейс пользователя', async () => {
  const store = createAuthorTextsStore();
  store.dispatch(authorTextsSignedIn(account));
  mockAuthorTextsApi(() => ({ data: '', status: 503 }));
  await expect(store.dispatch(authorTextsLike({ id: 1, value: 1 })).unwrap()).rejects.toMatchObject({ status: 503 });
  expect(store.getState().author_texts_auth.user).toEqual(account);
  expect(store.getState().author_texts_operations.pending).toBe(0);
  mockAuthorTextsApi(() => ({ data: '', status: 401 }));
  await expect(store.dispatch(authorTextsLike({ id: 1, value: 1 })).unwrap()).rejects.toMatchObject({ status: 401 });
  expect(store.getState().author_texts_auth.user).toBeNull();
});

it('гость не получает кнопку удаления даже при признаке владельца в ответе API', async () => {
  mockAuthorTextsApi(() => ({ data: [owned] }));
  renderAuthorTextsApp();
  await screen.findByRole('heading', { name: owned.work_title });
  expect(screen.queryByRole('button', { name: `Удалить «${owned.work_title}»` })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Добавление' })).toBeDisabled());
});
