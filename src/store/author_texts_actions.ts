import { createAction } from '@reduxjs/toolkit';
import type { AuthorTextsUserResponse } from '../api/author_texts_api.generated';

export const authorTextsSignedIn = createAction<AuthorTextsUserResponse>('author_texts/signedIn');
export const authorTextsSessionEnded = createAction('author_texts/sessionEnded');
export const authorTextsAuthPendingChanged = createAction<boolean>('author_texts/authPendingChanged');
