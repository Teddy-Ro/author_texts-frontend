import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthorTextsApp } from '../author_texts_app';
import { AUTHOR_TEXTS_DEFAULT_IMAGE, AUTHOR_TEXTS_DEFAULT_VIDEO } from '../modules/author_texts_utils';

function renderAuthorTexts(path = '/author_texts') {
  const fetchMock = vi.fn(() => { throw new Error('Lab 5 must not request the backend'); });
  vi.stubGlobal('fetch', fetchMock);
  const result = render(<MemoryRouter initialEntries={[path]}><AuthorTextsApp /></MemoryRouter>);
  return { ...result, fetchMock, user: userEvent.setup() };
}

describe('Гостевое React-приложение', () => {
  it('показывает mock-корпус без запросов к API и четыре пункта меню', () => {
    const { fetchMock } = renderAuthorTexts();
    expect(screen.getByRole('heading', { name: 'Корпус текстов' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Добавление' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Вход' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Корпус' })).toHaveAttribute('aria-current', 'page');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('показывает значение слайдера сразу, но фильтрует по кнопке', async () => {
    const { user } = renderAuthorTexts();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '100000' } });
    expect(screen.getByRole('slider')).toHaveValue('100000');
    expect(screen.getAllByRole('article')).toHaveLength(6);
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Преступление и наказание' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getByRole('slider')).toHaveValue('0');
  });

  it('обрабатывает пустой результат и ленту после него', async () => {
    const { user } = renderAuthorTexts();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '600000' } });
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    expect(screen.getByText('Тексты не найдены')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Лента' }));
    expect(screen.getByRole('heading', { name: 'Текст не найден' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'В корпус' }));
    await user.click(screen.getByRole('button', { name: 'Сбросить' }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });

  it('открывает выбранный текст и следующий по кругу', async () => {
    const { user, fetchMock } = renderAuthorTexts();
    await user.click(screen.getByRole('link', { name: 'Открыть «Демон»' }));
    expect(screen.getByRole('heading', { name: 'Демон' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Показать следующий текст' }));
    expect(screen.getByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Лента' })).toHaveAttribute('aria-current', 'page');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('следует текущему фильтру и сохраняет его при возврате в корпус', async () => {
    const { user } = renderAuthorTexts();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '100000' } });
    await user.click(screen.getByRole('button', { name: 'Применить' }));
    await user.click(screen.getByRole('link', { name: 'Лента' }));
    expect(screen.getByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Показать следующий текст' }));
    expect(screen.getByRole('heading', { name: 'Преступление и наказание' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Показать следующий текст' }));
    expect(screen.getByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Корпус' }));
    expect(screen.getByRole('slider')).toHaveValue('100000');
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('открывает прямой адрес и меняет заголовок вкладки через useEffect', async () => {
    renderAuthorTexts('/author_texts/feed/3');
    expect(screen.getByRole('heading', { name: 'Дама с собачкой' })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Дама с собачкой — лента авторских текстов'));
  });

  it('показывает первую карточку без ID и обрабатывает неизвестный ID', () => {
    const first = renderAuthorTexts('/author_texts/feed');
    expect(screen.getByRole('heading', { name: 'Война и мир' })).toBeInTheDocument();
    first.unmount();
    renderAuthorTexts('/author_texts/feed/9999');
    expect(screen.getByRole('heading', { name: 'Текст не найден' })).toBeInTheDocument();
  });

  it('демонстрирует локальные медиа по умолчанию в карточке без URL', () => {
    renderAuthorTexts('/author_texts/feed/5');
    expect(screen.getByRole('img')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_IMAGE);
    expect(screen.getByLabelText('Видео произведения «Отцы и дети»')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_VIDEO);
  });

  it('перенаправляет корневой адрес в корпус', () => {
    renderAuthorTexts('/');
    expect(screen.getByRole('heading', { name: 'Корпус текстов' })).toBeInTheDocument();
  });
});
