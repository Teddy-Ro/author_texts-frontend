import Nav from 'react-bootstrap/Nav';
import { NavLink, useLocation } from 'react-router-dom';
import { AUTHOR_TEXTS_CORPUS_PATH, AUTHOR_TEXTS_FEED_PATH, authorTextsFeedPath } from '../modules/author_texts_utils';
import { AuthorTextsIcon } from './author_texts_icon';

export function AuthorTextsNavigation({ firstId }: { firstId?: number }) {
  const { pathname } = useLocation();
  return (
    <Nav as="nav" className="author_texts_navigation" aria-label="Основная навигация">
      <Nav.Item>
        <Nav.Link as={NavLink} to={authorTextsFeedPath(firstId)} active={pathname.startsWith(AUTHOR_TEXTS_FEED_PATH)} aria-current={pathname.startsWith(AUTHOR_TEXTS_FEED_PATH) ? 'page' : undefined}>
          <AuthorTextsIcon name="feed" /><span>Лента</span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item><Nav.Link as="button" type="button" disabled title="Недоступно"><AuthorTextsIcon name="add" /><span>Добавление</span></Nav.Link></Nav.Item>
      <Nav.Item>
        <Nav.Link as={NavLink} to={AUTHOR_TEXTS_CORPUS_PATH} end active={pathname === AUTHOR_TEXTS_CORPUS_PATH}>
          <AuthorTextsIcon name="corpus" /><span>Корпус</span>
        </Nav.Link>
      </Nav.Item>
      <Nav.Item><Nav.Link as="button" type="button" disabled title="Недоступно"><AuthorTextsIcon name="login" /><span>Вход</span></Nav.Link></Nav.Item>
    </Nav>
  );
}
