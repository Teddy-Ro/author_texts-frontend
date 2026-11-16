import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { mockAuthorTextsApi, renderAuthorTextsApp } from './author_texts_helpers';
import { AUTHOR_TEXTS_DEFAULT_IMAGE, AUTHOR_TEXTS_DEFAULT_VIDEO } from '../modules/author_texts_utils';

async function renderAuthorTexts(path = '/author_texts') {
  const fetchMock = mockAuthorTextsApi(() => { throw new AxiosError('Backend unavailable', 'ERR_NETWORK'); });
  const result = renderAuthorTextsApp(path);
  await waitFor(() => expect(screen.queryByText(/Загрузка текст/)).not.toBeInTheDocument());
  return { ...result, fetchMock, user: userEvent.setup() };
}

describe('Гостевое React-приложение', () => {
  it('показывает mock-корпус при недоступном API и четыре пункта меню', async () => {
    const { fetchMock } = await renderAuthorTexts();
    expect(screen.getByRole('heading', { name: 'Корпус текстов' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(6));
    expect(screen.getByRole('button', { name: 'Добавление' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Вход' })).toHaveAttribute('href', '/author_texts/login');
    expect(screen.getByRole('link', { name: 'Корпус' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Лента' })).toHaveAttribute('href', '/author_texts/feed');
    expect(fetchMock).toHaveBeenCalled();
  });

  it('показывает значение слайдера сразу, но фильтрует по кнопке', async () => {
    const { user } = await renderAuthorTexts();
    fireEvent.change(screen.getByRole('slider', { name: 'Минимальная длина текста' }), { target: { value: '100000' } });
    expect(screen.getByRole('slider', { name: 'Минимальная длина текста' })).toHaveValue('100000');
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(6));
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2));
    expect(await screen.findByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Преступление и наказание' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(6));
    expect(screen.getByRole('slider', { name: 'Минимальная длина текста' })).toHaveValue('0');
  });

  it('обрабатывает пустой результат и ленту после него', async () => {
    const { user } = await renderAuthorTexts();
    fireEvent.change(screen.getByRole('slider', { name: 'Минимальная длина текста' }), { target: { value: '600000' } });
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    expect(await screen.findByText('Тексты не найдены')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Лента' }));
    expect(await screen.findByRole('heading', { name: 'Текст не найден' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'В корпус' }));
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(6));
  });

  it('открывает выбранный текст и следующий по кругу', async () => {
    const { user, fetchMock } = await renderAuthorTexts();
    await user.click(screen.getByRole('link', { name: 'Открыть «Демон»' }));
    expect(await screen.findByRole('heading', { name: 'Демон' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Показать следующий текст' }));
    expect(await screen.findByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Лента' })).toHaveAttribute('aria-current', 'page');
    expect(fetchMock).toHaveBeenCalled();
  });

  it('следует текущему фильтру и сохраняет его при возврате в корпус', async () => {
    const { user } = await renderAuthorTexts();
    fireEvent.change(screen.getByRole('slider', { name: 'Минимальная длина текста' }), { target: { value: '100000' } });
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    await user.click(screen.getByRole('link', { name: 'Лента' }));
    expect(await screen.findByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Показать следующий текст' }));
    expect(await screen.findByRole('heading', { name: 'Преступление и наказание' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Показать следующий текст' }));
    expect(await screen.findByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Корпус' }));
    expect(screen.getByRole('slider', { name: 'Минимальная длина текста' })).toHaveValue('100000');
    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(2));
  });

  it('открывает прямой адрес и меняет заголовок вкладки через useEffect', async () => {
    await renderAuthorTexts('/author_texts/feed/3');
    expect(screen.getByRole('heading', { name: 'Дама с собачкой' })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Дама с собачкой — лента авторских текстов'));
  });

  it('показывает первую карточку без ID и обрабатывает неизвестный ID', async () => {
    const first = await renderAuthorTexts('/author_texts/feed');
    expect(await screen.findByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    first.unmount();
    await renderAuthorTexts('/author_texts/feed/9999');
    expect(await screen.findByRole('heading', { name: 'Текст не найден' })).toBeInTheDocument();
  });

  it('демонстрирует локальные медиа по умолчанию в карточке без URL', async () => {
    await renderAuthorTexts('/author_texts/feed/5');
    expect(screen.getByRole('img')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_IMAGE);
    expect(screen.getByLabelText('Видео произведения «Отцы и дети»')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_VIDEO);
  });

  it('перенаправляет корневой адрес в корпус', async () => {
    await renderAuthorTexts('/');
    expect(screen.getByRole('heading', { name: 'Корпус текстов' })).toBeInTheDocument();
  });
});
