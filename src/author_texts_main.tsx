import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { authorTextsStore } from './store/author_texts_store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './author_texts_styles.css';
import { AuthorTextsApp } from './author_texts_app';

createRoot(document.getElementById('author_texts_root')!).render(
  <StrictMode><Provider store={authorTextsStore}><BrowserRouter><AuthorTextsApp /></BrowserRouter></Provider></StrictMode>,
);
