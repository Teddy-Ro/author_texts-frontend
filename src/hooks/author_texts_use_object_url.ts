import { useEffect, useState } from 'react';

export function useAuthorTextsObjectUrl(file: File | null): string | null {
  const [source, setSource] = useState<string | null>(null);
  useEffect(() => {
    if (!file) { setSource(null); return; }
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return source;
}
