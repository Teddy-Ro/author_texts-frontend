import { fireEvent, render, screen } from '@testing-library/react';
import { AuthorTextsImage } from '../components/author_texts_image';
import { AuthorTextsVideo } from '../components/author_texts_video';
import { AUTHOR_TEXTS_DEFAULT_IMAGE, AUTHOR_TEXTS_DEFAULT_VIDEO } from '../modules/author_texts_utils';

describe('Резервные медиа', () => {
  it('направляет MinIO-изображение через proxy фронтенда', () => {
    render(<AuthorTextsImage source="http://localhost:9000/author-texts-media/author_texts_cover.jpg" title="Проверка" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/author_texts_media/author_texts_cover.jpg');
  });
  it('подставляет локальное изображение при пустом поле', () => {
    render(<AuthorTextsImage source={null} title="Проверка" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_IMAGE);
  });

  it('заменяет недоступное изображение без повторного цикла ошибок', () => {
    render(<AuthorTextsImage source="/missing.jpg" title="Проверка" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_IMAGE);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_IMAGE);
  });

  it('использует новый источник при изменении карточки', () => {
    const view = render(<AuthorTextsImage source="/missing.jpg" title="Проверка" />);
    fireEvent.error(screen.getByRole('img'));
    view.rerender(<AuthorTextsImage source="/another.jpg" title="Другой текст" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/another.jpg');
  });

  it('подставляет локальное видео при пустом поле', () => {
    render(<AuthorTextsVideo source="" poster={null} title="Проверка" />);
    expect(screen.getByLabelText('Видео произведения «Проверка»')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_VIDEO);
    expect(screen.getByRole('img')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_IMAGE);
  });

  it('заменяет ошибочное видео и сохраняет обложку, если резервное тоже недоступно', () => {
    render(<AuthorTextsVideo source="/missing.webm" poster={null} title="Проверка" />);
    fireEvent.error(screen.getByLabelText('Видео произведения «Проверка»'));
    expect(screen.getByLabelText('Видео произведения «Проверка»')).toHaveAttribute('src', AUTHOR_TEXTS_DEFAULT_VIDEO);
    fireEvent.error(screen.getByLabelText('Видео произведения «Проверка»'));
    expect(screen.queryByLabelText('Видео произведения «Проверка»')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
