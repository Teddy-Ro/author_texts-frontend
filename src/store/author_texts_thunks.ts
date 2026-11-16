import { createAsyncThunk } from '@reduxjs/toolkit';
import { authorTextsApi, authorTextsFailure } from '../api/author_texts_client';
import type { AuthorTextsFailure } from '../api/author_texts_client';
import type { AuthorTextsPublish, BodyCreateAuthorTextsAuthorTextsPost } from '../api/author_texts_api.generated';
import { authorTextsSessionEnded } from './author_texts_actions';
import { authorTextsList, authorTextsDetail, authorTextsNextCard } from '../modules/author_texts_api';

const createAuthorTextsThunk = createAsyncThunk.withTypes<{ rejectValue: AuthorTextsFailure }>();

export const authorTextsFetchList = createAuthorTextsThunk('author_texts/fetchList', async ({ minimum, allowMock }: { minimum: number; allowMock: boolean }, api) => {
  try { return await authorTextsList(minimum, api.signal, allowMock); }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});

export const authorTextsFetchCard = createAuthorTextsThunk('author_texts/fetchCard', async ({ id, allowMock }: { id?: number; allowMock: boolean }, api) => {
  try { return await authorTextsDetail(id, api.signal, allowMock); }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});

export const authorTextsFetchNext = createAuthorTextsThunk('author_texts/fetchNext', async ({ id, allowMock }: { id: number; allowMock: boolean }, api) => {
  try { return await authorTextsNextCard(id, api.signal, allowMock); }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});

export const authorTextsLoadDraft = createAuthorTextsThunk('author_texts/loadDraft', async (_, api) => {
  try { return await authorTextsApi.authorTexts.getAuthorTextsDraftAuthorTextsDraftGet({ signal: api.signal }); }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 404) return null;
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});

export const authorTextsCreate = createAuthorTextsThunk('author_texts/create', async (payload: BodyCreateAuthorTextsAuthorTextsPost, api) => {
  try { return await authorTextsApi.authorTexts.createAuthorTextsAuthorTextsPost(payload, { signal: api.signal, timeout: 90_000 }); }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});

export const authorTextsPublish = createAuthorTextsThunk('author_texts/publish', async ({ id, fields }: { id: number; fields: AuthorTextsPublish }, api) => {
  try { return await authorTextsApi.authorTexts.publishAuthorTextsAuthorTextsAuthorTextIdPublishPut(id, fields, { signal: api.signal }); }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});

export const authorTextsDelete = createAuthorTextsThunk('author_texts/delete', async (id: number, api) => {
  try { await authorTextsApi.authorTexts.deleteAuthorTextsAuthorTextsAuthorTextIdDelete(id, { signal: api.signal }); return id; }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});

export const authorTextsLike = createAuthorTextsThunk('author_texts/like', async ({ id, value }: { id: number; value: 0 | 1 }, api) => {
  try { return await authorTextsApi.authorTexts.likeAuthorTextsAuthorTextsAuthorTextIdLikePost(id, { value }, { signal: api.signal }); }
  catch (error) {
    const failure = authorTextsFailure(error);
    if (failure.status === 401) api.dispatch(authorTextsSessionEnded());
    return api.rejectWithValue(failure);
  }
});
