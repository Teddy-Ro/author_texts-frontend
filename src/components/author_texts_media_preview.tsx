import { useState } from 'react';
import { useAuthorTextsObjectUrl } from '../hooks/author_texts_use_object_url';
import { AUTHOR_TEXTS_DEFAULT_IMAGE, AUTHOR_TEXTS_DEFAULT_VIDEO, authorTextsMediaPath } from '../modules/author_texts_utils';
import { AuthorTextsImage } from './author_texts_image';

interface AuthorTextsMediaPreviewProps {
  kind: 'image' | 'video';
  title: string;
  source?: string | null;
  file?: File | null;
  onChange?: (file: File | null) => void;
  disabled?: boolean;
  formId?: string;
}

export function AuthorTextsMediaPreview({ kind, title, source, file = null, onChange, disabled, formId }: AuthorTextsMediaPreviewProps) {
  const objectUrl = useAuthorTextsObjectUrl(file);
  const requested = objectUrl || source || (onChange ? null : kind === 'image' ? AUTHOR_TEXTS_DEFAULT_IMAGE : AUTHOR_TEXTS_DEFAULT_VIDEO);
  const [failedVideo, setFailedVideo] = useState<string | null>(null);
  const video = !requested || requested === failedVideo ? AUTHOR_TEXTS_DEFAULT_VIDEO : requested;
  const inputId = `author_texts_create_${kind}`;
  return <div className="author_texts_media_preview">
    {requested && (kind === 'image' ? <AuthorTextsImage source={requested} title={title || 'Новый текст'} eager />
      : <video key={video} src={authorTextsMediaPath(video)} controls playsInline preload="metadata" aria-label="Предпросмотр видео"
        onError={() => { if (video !== AUTHOR_TEXTS_DEFAULT_VIDEO) setFailedVideo(requested); }} />)}
    {onChange && <>
      <input id={inputId} form={formId} className="visually-hidden" type="file" required disabled={disabled}
        aria-label={kind === 'image' ? 'Изображение' : 'Видео'}
        accept={kind === 'image' ? 'image/jpeg,image/png,image/webp' : 'video/mp4,video/webm'}
        onChange={(event) => onChange(event.currentTarget.files?.[0] ?? null)} />
      <label htmlFor={inputId} className={`btn btn-secondary author_texts_media_choose${disabled ? ' disabled' : ''}`}>
        + Выбрать {kind === 'image' ? 'изображение' : 'видео'}
      </label>
      {file && <span className="author_texts_media_filename">{file.name}</span>}
    </>}
  </div>;
}
