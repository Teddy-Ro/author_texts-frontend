export interface AuthorText {
  author_text_id: number;
  work_title: string;
  short_description: string | null;
  author_texts_image_url: string | null;
  author_texts_video_url: string | null;
  unique_token_count: number | null;
  text_length: number | null;
  author_texts_ratio: number | null;
  author_texts_like_count: number;
  is_owner: 0 | 1;
  is_liked: 0 | 1;
}
