import { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AuthorTextsApp } from '../author_texts_app';
import { authorTextsApi } from '../api/author_texts_client';
import { createAuthorTextsStore } from '../store/author_texts_store';

export function mockAuthorTextsApi(handler: (config: InternalAxiosRequestConfig) => { data: unknown; status?: number } | Promise<{ data: unknown; status?: number }>) {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
    const result = await handler(config);
    const response = { data: result.data, status: result.status ?? 200, statusText: '', headers: new AxiosHeaders(), config };
    if (response.status >= 400) throw new AxiosError(`HTTP ${response.status}`, 'ERR_BAD_RESPONSE', config, undefined, response);
    return response;
  });
  authorTextsApi.instance.defaults.adapter = adapter;
  return adapter;
}

export function renderAuthorTextsApp(path = '/author_texts', store = createAuthorTextsStore()) {
  const view = render(<Provider store={store}><MemoryRouter initialEntries={[path]}><AuthorTextsApp /></MemoryRouter></Provider>);
  return { ...view, store };
}
