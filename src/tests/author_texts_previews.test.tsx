import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthorTextsMediaPreview } from '../components/author_texts_media_preview';
import { AUTHOR_TEXTS_MOCK } from '../modules/author_texts_mock';
import { createAuthorTextsStore } from '../store/author_texts_store';
import { authorTextsSignedIn } from '../store/author_texts_actions';
import { mockAuthorTextsApi, renderAuthorTextsApp } from './author_texts_helpers';

function mockObjectUrls() {
  let counter = 0;
  const create = vi.fn(() => `blob:author_texts_${++counter}`);
  const revoke = vi.fn();
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = create;
    static revokeObjectURL = revoke;
  });
  return { create, revoke };
}

it('сразу показывает выбранные фото и видео и отправляет файлы только по Далее', async () => {
  const urls = mockObjectUrls();
  const draft = { ...AUTHOR_TEXTS_MOCK[0], author_text_id: 501, work_title: 'Новый текст',
    author_texts_image_url: 'http://localhost:9000/author-texts-media/author_texts_uploaded.jpg',
    author_texts_video_url: 'http://localhost:9000/author-texts-media/author_texts_uploaded.webm', attributes: [] };
  const adapter = mockAuthorTextsApi((config) => {
    if (config.url === '/author_texts/draft') return { data: '', status: 404 };
    if (config.method === 'post') return { data: draft, status: 201 };
    return { data: [AUTHOR_TEXTS_MOCK[0]] };
  });
  const store = createAuthorTextsStore();
  store.dispatch(authorTextsSignedIn({ author_texts_user_id: 77, username: 'preview_user' }));
  renderAuthorTextsApp('/author_texts/add', store);
  const user = userEvent.setup();
  await screen.findByText(/Шаг 1 из 2/);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Предпросмотр видео')).not.toBeInTheDocument();
  await user.upload(screen.getByLabelText('Изображение', { exact: true }), new File(['photo'], 'cover.jpg', { type: 'image/jpeg' }));
  expect(screen.queryByLabelText('Предпросмотр видео')).not.toBeInTheDocument();
  await user.upload(screen.getByLabelText('Видео', { exact: true }), new File(['video'], 'clip.webm', { type: 'video/webm' }));
  await waitFor(() => expect(urls.create).toHaveBeenCalledTimes(2));
  expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:author_texts_1');
  expect(screen.getByLabelText('Предпросмотр видео')).toHaveAttribute('src', 'blob:author_texts_2');
  expect(adapter.mock.calls.filter(([config]) => config.method === 'post')).toHaveLength(0);
  await user.type(screen.getByLabelText('Название произведения'), 'Новый текст');
  // jsdom does not validate external file controls like a real browser.
  fireEvent.submit(screen.getByRole('button', { name: 'Далее' }).closest('form')!);
  await screen.findByText(/Шаг 2 из 2/);
  const upload = adapter.mock.calls.find(([config]) => config.method === 'post')?.[0].data as FormData;
  expect(upload.get('work_title')).toBe('Новый текст');
  expect(upload.get('author_texts_image')).toBeInstanceOf(File);
  expect(upload.get('author_texts_video')).toBeInstanceOf(File);
  expect(screen.getByLabelText('Предпросмотр видео')).toHaveAttribute('src', '/author_texts_media/author_texts_uploaded.webm');
  expect(urls.revoke).toHaveBeenCalledWith('blob:author_texts_1');
  expect(urls.revoke).toHaveBeenCalledWith('blob:author_texts_2');
});

it('освобождает временные адреса при замене файла и закрытии предпросмотра', async () => {
  const urls = mockObjectUrls();
  const first = new File(['first'], 'first.jpg', { type: 'image/jpeg' });
  const second = new File(['second'], 'second.jpg', { type: 'image/jpeg' });
  const view = render(<AuthorTextsMediaPreview kind="image" title="Проверка" file={first} />);
  expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:author_texts_1');
  view.rerender(<AuthorTextsMediaPreview kind="image" title="Проверка" file={second} />);
  expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:author_texts_2');
  expect(urls.revoke).toHaveBeenCalledWith('blob:author_texts_1');
  view.unmount();
  expect(urls.revoke).toHaveBeenCalledWith('blob:author_texts_2');
});

it('позволяет раскрыть и свернуть длинное описание в ленте', async () => {
  const text = { ...AUTHOR_TEXTS_MOCK[0], short_description: 'Длинное описание авторского текста. '.repeat(10) };
  mockAuthorTextsApi((config) => ({ data: config.url?.includes('/feed') ? text : [text] }));
  renderAuthorTextsApp('/author_texts/feed/1');
  const user = userEvent.setup();
  const more = await screen.findByRole('button', { name: 'Больше' });
  expect(more).toHaveAttribute('aria-expanded', 'false');
  await user.click(more);
  const less = screen.getByRole('button', { name: 'Меньше' });
  expect(less).toHaveAttribute('aria-expanded', 'true');
  await user.click(less);
  expect(screen.getByRole('button', { name: 'Больше' })).toHaveAttribute('aria-expanded', 'false');
});
