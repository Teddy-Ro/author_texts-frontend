import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { authorTextsApi } from '../api/author_texts_client';
import { authorTextsDetail, authorTextsList, authorTextsNextCard } from '../modules/author_texts_api';
import { AUTHOR_TEXTS_MOCK } from '../modules/author_texts_mock';
import { mockAuthorTextsApi, renderAuthorTextsApp } from './author_texts_helpers';

const card = { ...AUTHOR_TEXTS_MOCK[0], author_text_id: 301, work_title: 'Текст из PostgreSQL',
  attributes: [{ author_texts_attribute_id: 12, attribute_name: 'Эпоха', attribute_value: 'XIX век' }] };
const signal = () => new AbortController().signal;
beforeEach(() => vi.stubEnv('VITE_AUTHOR_TEXTS_DATA_MODE', 'auto'));

it('передаёт фильтр через относительный URL Axios и сохраняет MinIO URL в данных', async () => {
  const minioCard = { ...card, author_texts_image_url: 'http://localhost:9000/author-texts-media/cover.jpg' };
  const adapter = mockAuthorTextsApi(() => ({ data: [minioCard] }));
  expect(await authorTextsList(100000, signal())).toEqual({ data: [minioCard], source: 'api' });
  expect(authorTextsApi.instance.getUri(adapter.mock.calls[0][0])).toBe('/api/author_texts?min_text_length=100000');
  expect(adapter.mock.calls[0][0].withCredentials).toBe(true);
});

it('делает отдельные GET первой, выбранной и следующей карточки', async () => {
  const adapter = mockAuthorTextsApi(() => ({ data: card }));
  await authorTextsDetail(undefined, signal());
  await authorTextsDetail(301, signal());
  await authorTextsNextCard(301, signal());
  expect(adapter.mock.calls.map(([config]) => authorTextsApi.instance.getUri(config))).toEqual([
    '/api/author_texts/feed', '/api/author_texts/feed?author_text_id=301', '/api/author_texts/feed?author_text_id=301&next=true',
  ]);
});

it('сохраняет пустой успешный список и не заменяет 404 локальной карточкой с тем же ID', async () => {
  mockAuthorTextsApi((config) => config.url?.includes('/feed') ? { data: '', status: 404 } : { data: [] });
  expect(await authorTextsList(0, signal())).toEqual({ data: [], source: 'api' });
  expect(await authorTextsDetail(1, signal())).toEqual({ data: null, source: 'api' });
});

it.each(['network', 'server', 'invalid'])('использует отфильтрованный mock гостя при сбое %s', async (failure) => {
  mockAuthorTextsApi(() => {
    if (failure === 'network') throw new AxiosError('offline', 'ERR_NETWORK');
    return failure === 'server' ? { data: '', status: 503 } : { data: [{ author_text_id: 1 }] };
  });
  const result = await authorTextsList(100000, signal());
  expect(result.source).toBe('mock');
  expect(result.data.map((text) => text.author_text_id)).toEqual([1, 4]);
});

it('не использует mock для авторизованного пользователя, ошибки доступа и отмены', async () => {
  mockAuthorTextsApi(() => ({ data: '', status: 403 }));
  await expect(authorTextsList(0, signal())).rejects.toThrow('403');
  mockAuthorTextsApi(() => { throw new AxiosError('offline', 'ERR_NETWORK'); });
  await expect(authorTextsList(0, signal(), false)).rejects.toThrow('offline');
  const controller = new AbortController();
  controller.abort();
  await expect(authorTextsList(0, controller.signal)).rejects.toThrow();
});

it('позволяет гостю явно включить mock без обращений к API', async () => {
  vi.stubEnv('VITE_AUTHOR_TEXTS_DATA_MODE', 'mock');
  const adapter = mockAuthorTextsApi(() => ({ data: [] }));
  expect((await authorTextsList(0, signal())).source).toBe('mock');
  expect(adapter).not.toHaveBeenCalled();
});

it('открывает атрибуты через круглую кнопку подробнее, сохраняя фильтр при возврате', async () => {
  const adapter = mockAuthorTextsApi((config) => ({ data: config.url?.includes('/feed') ? card : [card] }));
  renderAuthorTextsApp();
  const user = userEvent.setup();
  await screen.findByRole('heading', { name: card.work_title });
  fireEvent.change(screen.getByRole('slider', { name: 'Минимальная длина текста' }), { target: { value: '100000' } });
  await user.click(screen.getByRole('button', { name: 'Применить' }));
  await waitFor(() => expect(adapter.mock.calls.some(([config]) => config.params?.min_text_length === 100000)).toBe(true));
  await user.click(await screen.findByRole('link', { name: `Подробнее о «${card.work_title}»` }));
  expect(await screen.findByRole('columnheader', { name: 'Атрибут' })).toBeInTheDocument();
  expect(screen.getByRole('rowheader', { name: 'Эпоха' })).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: 'XIX век' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Открыть в ленте' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Корпус' }));
  await user.click(await screen.findByRole('link', { name: `Открыть «${card.work_title}»` }));
  await screen.findByRole('heading', { name: card.work_title });
  expect(screen.queryByText('Эпоха')).not.toBeInTheDocument();
  expect(screen.queryByText('← Корпус')).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Корпус' }));
  expect(screen.getByRole('slider', { name: 'Минимальная длина текста' })).toHaveValue('100000');
});
