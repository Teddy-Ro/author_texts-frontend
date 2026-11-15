interface AuthorTextsIconProps {
  name: 'feed' | 'add' | 'corpus' | 'login' | 'heart' | 'next';
}

export function AuthorTextsIcon({ name }: AuthorTextsIconProps) {
  const paths = {
    feed: <path d="M8 4.5v15l12-7.5Z" fill="currentColor" stroke="none" />,
    add: <path d="M12 5v14M5 12h14" />,
    corpus: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    login: <><path d="M14 4h6v16h-6M4 12h11M10 7l5 5-5 5" /></>,
    heart: <path d="M12 21 3.5 12.6C-2 6.7 5.5-.9 12 5.2 18.5-.9 26 6.7 20.5 12.6Z" fill="currentColor" stroke="none" />,
    next: <path d="M4 12h16M13 5l7 7-7 7" />,
  };
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
