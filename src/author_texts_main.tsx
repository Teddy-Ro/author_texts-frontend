import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './author_texts_styles.css';
import { AuthorTextsApp } from './author_texts_app';

createRoot(document.getElementById('author_texts_root')!).render(
  <StrictMode><BrowserRouter><AuthorTextsApp /></BrowserRouter></StrictMode>,
);
