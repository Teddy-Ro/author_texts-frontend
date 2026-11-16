import { configureStore, createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthorTextsUserResponse } from '../api/author_texts_api.generated';
import type { AuthorText } from '../modules/author_texts_types';
import { authorTextsSignedIn, authorTextsSessionEnded, authorTextsAuthPendingChanged } from './author_texts_actions';
import { authorTextsCreate, authorTextsDelete, authorTextsLike, authorTextsLoadDraft, authorTextsPublish, authorTextsFetchList, authorTextsFetchCard, authorTextsFetchNext } from './author_texts_thunks';

const auth = createSlice({
  name: 'author_texts_auth', initialState: { user: null as AuthorTextsUserResponse | null, pending: false }, reducers: {},
  extraReducers: (builder) => builder
    .addCase(authorTextsSignedIn, (state, action) => { state.user = action.payload; state.pending = false; })
    .addCase(authorTextsSessionEnded, (state) => { state.user = null; state.pending = false; })
    .addCase(authorTextsAuthPendingChanged, (state, action) => { state.pending = action.payload; }),
});

const filter = createSlice({
  name: 'author_texts_filter', initialState: { minimum: 0, appliedMinimum: 0 },
  reducers: {
    authorTextsMinimumChanged: (state, action: PayloadAction<number>) => { state.minimum = action.payload; },
    authorTextsFilterApplied: (state) => { state.appliedMinimum = state.minimum; },
    authorTextsFilterReset: (state) => { state.minimum = 0; state.appliedMinimum = 0; },
  },
  extraReducers: (builder) => builder.addCase(authorTextsSessionEnded, () => ({ minimum: 0, appliedMinimum: 0 })),
});
export const { authorTextsMinimumChanged, authorTextsFilterApplied, authorTextsFilterReset } = filter.actions;

const requests = [authorTextsLoadDraft, authorTextsCreate, authorTextsPublish, authorTextsDelete, authorTextsLike, authorTextsFetchList, authorTextsFetchCard, authorTextsFetchNext] as const;
const operations = createSlice({
  name: 'author_texts_operations',
  initialState: { draft: null as AuthorText | null, pending: 0, revision: 0, error: null as string | null },
  reducers: { authorTextsErrorCleared: (state) => { state.error = null; } },
  extraReducers: (builder) => builder
    .addCase(authorTextsLoadDraft.fulfilled, (state, action) => { state.draft = action.payload; })
    .addCase(authorTextsCreate.fulfilled, (state, action) => { state.draft = action.payload; })
    .addCase(authorTextsPublish.fulfilled, (state) => { state.draft = null; state.revision++; })
    .addCase(authorTextsDelete.fulfilled, (state) => { state.revision++; })
    .addCase(authorTextsLike.fulfilled, (state) => { state.revision++; })
    .addCase(authorTextsSessionEnded, (state) => { state.draft = null; state.error = null; state.revision++; })
    .addCase(authorTextsSignedIn, (state) => { state.draft = null; state.error = null; state.revision++; })
    .addMatcher(isPending(...requests), (state) => { state.pending++; state.error = null; })
    .addMatcher(isFulfilled(...requests), (state) => { state.pending = Math.max(0, state.pending - 1); })
    .addMatcher(isRejected(...requests), (state, action) => {
      state.pending = Math.max(0, state.pending - 1);
      if (!action.meta.aborted) state.error = action.payload?.message ?? 'Не удалось выполнить запрос.';
    }),
});
export const { authorTextsErrorCleared } = operations.actions;

export const createAuthorTextsStore = () => configureStore({
  reducer: { author_texts_auth: auth.reducer, author_texts_filter: filter.reducer, author_texts_operations: operations.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
export const authorTextsStore = createAuthorTextsStore();
export type AuthorTextsStore = ReturnType<typeof createAuthorTextsStore>;
export type AuthorTextsState = ReturnType<AuthorTextsStore['getState']>;
export type AuthorTextsDispatch = AuthorTextsStore['dispatch'];
