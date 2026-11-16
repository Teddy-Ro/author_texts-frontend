import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { AxiosError } from 'axios';
import { authorTextsApi } from '../api/author_texts_client';

const defaultAdapter = authorTextsApi.instance.defaults.adapter;
beforeEach(() => {
  authorTextsApi.instance.defaults.adapter = async () => { throw new AxiosError('Backend unavailable', 'ERR_NETWORK'); };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  authorTextsApi.instance.defaults.adapter = defaultAdapter;
});
