import { useState } from 'react';
import Image from 'react-bootstrap/Image';
import { AUTHOR_TEXTS_DEFAULT_IMAGE, authorTextsMediaPath } from '../modules/author_texts_utils';

interface AuthorTextsImageProps {
  source: string | null;
  title: string;
  className?: string;
  eager?: boolean;
}

export function AuthorTextsImage({ source, title, className, eager = false }: AuthorTextsImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const image = source && source !== failedSource ? source : AUTHOR_TEXTS_DEFAULT_IMAGE;
  return (
    <Image
      src={authorTextsMediaPath(image)}
      alt={`Обложка произведения «${title}»`}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      data-author-texts-fallback={image === AUTHOR_TEXTS_DEFAULT_IMAGE}
      onError={() => { if (image !== AUTHOR_TEXTS_DEFAULT_IMAGE) setFailedSource(source); }}
    />
  );
}
