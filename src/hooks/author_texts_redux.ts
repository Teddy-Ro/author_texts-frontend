import { useDispatch, useSelector } from 'react-redux';
import type { AuthorTextsDispatch, AuthorTextsState } from '../store/author_texts_store';

export const useAuthorTextsDispatch = useDispatch.withTypes<AuthorTextsDispatch>();
export const useAuthorTextsSelector = useSelector.withTypes<AuthorTextsState>();
