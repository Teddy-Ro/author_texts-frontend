import { useState } from 'react';
import { AUTHOR_TEXTS_DEFAULT_VIDEO } from '../modules/author_texts_utils';
import { AuthorTextsImage } from './author_texts_image';

interface AuthorTextsVideoProps {
  source: string | null;
  poster: string | null;
  title: string;
}

export function AuthorTextsVideo({ source, poster, title }: AuthorTextsVideoProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const requested = source || AUTHOR_TEXTS_DEFAULT_VIDEO;
  const video = !failedSources.includes(requested)
    ? requested
    : !failedSources.includes(AUTHOR_TEXTS_DEFAULT_VIDEO) ? AUTHOR_TEXTS_DEFAULT_VIDEO : null;

  return (
    <div className="author_texts_feed_media">
      <AuthorTextsImage source={poster} title={title} eager />
      {video && (
        <video
          key={video}
          src={video}
          className="author_texts_feed_video"
          aria-label={`Видео произведения «${title}»`}
          autoPlay muted loop playsInline preload="metadata"
          data-author-texts-fallback={video === AUTHOR_TEXTS_DEFAULT_VIDEO}
          onError={() => setFailedSources((previous) => [...previous, video])}
        />
      )}
    </div>
  );
}
