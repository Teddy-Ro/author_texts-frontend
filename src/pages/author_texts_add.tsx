import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthorTextsDispatch, useAuthorTextsSelector } from '../hooks/author_texts_redux';
import { useAuthorTextsTitle } from '../hooks/author_texts_use_title';
import { authorTextsCreate, authorTextsLoadDraft, authorTextsPublish } from '../store/author_texts_thunks';
import { AuthorTextsMediaPreview } from '../components/author_texts_media_preview';
import { AUTHOR_TEXTS_LOGIN_PATH, authorTextsDetailsPath } from '../modules/author_texts_utils';
import type { AuthorText, AuthorTextsAttribute } from '../modules/author_texts_types';

function AuthorTextsPublishForm({ draft, definitions }: { draft: AuthorText; definitions: readonly AuthorTextsAttribute[] }) {
  const dispatch = useAuthorTextsDispatch();
  const navigate = useNavigate();
  const busy = useAuthorTextsSelector((state) => state.author_texts_operations.pending > 0);
  const [title, setTitle] = useState(draft.work_title);
  const [description, setDescription] = useState(draft.short_description ?? '');
  const [length, setLength] = useState(draft.text_length?.toString() ?? '');
  const [unique, setUnique] = useState(draft.unique_token_count?.toString() ?? '');
  const [values, setValues] = useState<Record<number, string>>(() => Object.fromEntries(draft.attributes.map((item) => [item.author_texts_attribute_id, item.attribute_value])));
  const [error, setError] = useState('');
  const attributes = [...new Map([...definitions, ...draft.attributes].map((item) => [item.author_texts_attribute_id, item])).values()]
    .sort((left, right) => left.author_texts_attribute_id - right.author_texts_attribute_id);

  const publish = async () => {
    const total = Number(length), distinct = Number(unique);
    if (!title.trim() || !description.trim() || !Number.isSafeInteger(total) || !Number.isSafeInteger(distinct)
      || total < 1 || distinct < 1 || total > 2147483647 || distinct > total) {
      setError('Заполните название и описание. Количества должны быть положительными целыми; уникальных не больше общего.'); return;
    }
    setError('');
    try {
      const text = await dispatch(authorTextsPublish({ id: draft.author_text_id, fields: {
        work_title: title.trim(), short_description: description.trim(), text_length: total, unique_token_count: distinct,
        attributes: attributes.flatMap((item) => {
          const value = values[item.author_texts_attribute_id]?.trim();
          return value ? [{ author_texts_attribute_id: item.author_texts_attribute_id, attribute_value: value }] : [];
        }),
      } })).unwrap();
      navigate(authorTextsDetailsPath(text.author_text_id));
    } catch { /* The Redux operation error is shown by the application. */ }
  };
  return <>
    <p>Шаг 2 из 2 · Заполните сведения и опубликуйте текст</p>
    <AuthorTextsMediaPreview kind="video" source={draft.author_texts_video_url} title={title} />
    <AuthorTextsMediaPreview kind="image" source={draft.author_texts_image_url} title={title} />
    <Form onSubmit={(event) => { event.preventDefault(); void publish(); }}>
      <fieldset disabled={busy}>
        <Form.Group controlId="author_texts_publish_title"><Form.Label>Название произведения</Form.Label>
          <Form.Control required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} />
        </Form.Group>
        <Form.Group controlId="author_texts_description"><Form.Label>Краткое описание</Form.Label>
          <Form.Control as="textarea" rows={3} required maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} />
        </Form.Group>
        <Form.Group controlId="author_texts_length"><Form.Label>Общее количество токенов</Form.Label>
          <Form.Control type="number" required min={1} max={2147483647} step={1} value={length} onChange={(event) => setLength(event.target.value)} />
        </Form.Group>
        <Form.Group controlId="author_texts_unique"><Form.Label>Количество уникальных токенов</Form.Label>
          <Form.Control type="number" required min={1} max={2147483647} step={1} value={unique} onChange={(event) => setUnique(event.target.value)} />
        </Form.Group>
        {attributes.length > 0 && <section className="author_texts_attributes">
          <h2>Дополнительные характеристики</h2>
          <table><thead><tr><th scope="col">Атрибут</th><th scope="col">Значение</th></tr></thead>
            <tbody>{attributes.map((item) => <tr key={item.author_texts_attribute_id}>
              <th scope="row"><label htmlFor={`author_texts_attribute_${item.author_texts_attribute_id}`}>{item.attribute_name}</label></th>
              <td><Form.Control id={`author_texts_attribute_${item.author_texts_attribute_id}`} maxLength={500} value={values[item.author_texts_attribute_id] ?? ''}
                onChange={(event) => setValues({ ...values, [item.author_texts_attribute_id]: event.target.value })} /></td>
            </tr>)}</tbody>
          </table>
        </section>}
        <Button type="submit" variant="secondary">Опубликовать</Button>
      </fieldset>
    </Form>
    {error && <p role="alert">{error}</p>}
  </>;
}

export function AuthorTextsAdd({ definitions }: { definitions: readonly AuthorTextsAttribute[] }) {
  const dispatch = useAuthorTextsDispatch();
  const user = useAuthorTextsSelector((state) => state.author_texts_auth.user);
  const { draft, pending } = useAuthorTextsSelector((state) => state.author_texts_operations);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState('');
  useAuthorTextsTitle('Добавление авторского текста');
  useEffect(() => {
    if (!user) return;
    setLoaded(false);
    let active = true;
    const request = dispatch(authorTextsLoadDraft());
    request.then(() => { if (active) setLoaded(true); });
    return () => { active = false; request.abort(); };
  }, [dispatch, user]);

  if (!user) return <section className="author_texts_form_page"><h1>Добавление текста</h1><p>Для добавления авторского текста войдите в систему.</p>
    <Link to={AUTHOR_TEXTS_LOGIN_PATH} className="btn btn-secondary">Войти</Link></section>;
  const create = async () => {
    if (!title.trim() || !image || !video) { setError('Укажите название, изображение и видео.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 10 * 1024 * 1024
      || !['video/webm', 'video/mp4'].includes(video.type) || video.size > 50 * 1024 * 1024) {
      setError('Изображение: JPEG, PNG или WebP до 10 МиБ. Видео: MP4 или WebM до 50 МиБ.'); return;
    }
    setError('');
    try {
      await dispatch(authorTextsCreate({ work_title: title.trim(), author_texts_image: image, author_texts_video: video })).unwrap();
      setImage(null); setVideo(null);
    } catch { /* The Redux operation error is shown by the application. */ }
  };
  return <section className="author_texts_form_page">
    <h1>Добавление текста</h1>
    {!loaded ? <p role="status">Загрузка черновика…</p> : draft ? <AuthorTextsPublishForm key={draft.author_text_id} draft={draft} definitions={definitions} /> : <>
      <p>Шаг 1 из 2 · Название, обложка и короткое видео</p>
      <AuthorTextsMediaPreview kind="video" title={title} file={video} onChange={setVideo} disabled={pending > 0} formId="author_texts_create_form" />
      <AuthorTextsMediaPreview kind="image" title={title} file={image} onChange={setImage} disabled={pending > 0} formId="author_texts_create_form" />
      <Form id="author_texts_create_form" onSubmit={(event) => { event.preventDefault(); void create(); }}>
        <fieldset disabled={pending > 0}>
          <Form.Group controlId="author_texts_create_title"><Form.Label>Название произведения</Form.Label>
            <Form.Control required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} />
          </Form.Group>
          <Button type="submit" variant="secondary">Далее</Button>
        </fieldset>
      </Form>
    </>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
