import axios from 'axios';
import { AuthorTextsApi } from './author_texts_api.generated';

export const authorTextsApi = new AuthorTextsApi({ baseURL: '/api', withCredentials: true, timeout: 8000 });

export interface AuthorTextsFailure { status: number | null; message: string }

export function authorTextsFailure(error: unknown): AuthorTextsFailure {
  const status = axios.isAxiosError(error) ? error.response?.status ?? null : null;
  const messages: Record<number, string> = {
    401: 'Нужен вход в систему. Проверьте имя пользователя и пароль.',
    403: 'Сервер отклонил запрос. Проверьте настройки proxy.',
    404: 'Текст или черновик не найден.',
    409: 'Имя пользователя уже занято либо у вас уже есть черновик.',
    422: 'Проверьте поля формы, файлы и количества токенов.',
    503: 'Хранилище временно недоступно. Повторите позже.',
  };
  return { status, message: status === null ? 'Нет связи с сервером. Проверьте backend и повторите.' : messages[status] ?? 'Не удалось выполнить запрос.' };
}
