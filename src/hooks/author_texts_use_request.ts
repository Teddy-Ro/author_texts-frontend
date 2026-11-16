import { useEffect, useState } from 'react';
import type { AuthorTextsResult } from '../modules/author_texts_api';

export function useAuthorTextsRequest<T>(load: (signal: AbortSignal) => Promise<AuthorTextsResult<T>>) {
  const [state, setState] = useState<{
    result: AuthorTextsResult<T> | null; loading: boolean; error: string | null;
  }>({ result: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ result: null, loading: true, error: null });
    load(controller.signal).then(
      (result) => { if (!controller.signal.aborted) setState({ result, loading: false, error: null }); },
      () => { if (!controller.signal.aborted) setState({ result: null, loading: false, error: 'Не удалось загрузить тексты. Обновите страницу.' }); },
    );
    return () => controller.abort();
  }, [load]);
  return { ...state, replace: (result: AuthorTextsResult<T>) => setState({ result, loading: false, error: null }) };
}
