import warImage from '../assets/media/author_texts-tolstoy-war-and-peace.jpg';
import warVideo from '../assets/media/author_texts-tolstoy-war-and-peace.webm';
import captainImage from '../assets/media/author_texts-pushkin-captains-daughter.jpg';
import captainVideo from '../assets/media/author_texts-pushkin-captains-daughter.webm';
import ladyImage from '../assets/media/author_texts-chekhov-lady-with-dog.jpg';
import ladyVideo from '../assets/media/author_texts-chekhov-lady-with-dog.webm';
import crimeImage from '../assets/media/author_texts-dostoevsky-crime-punishment.jpg';
import crimeVideo from '../assets/media/author_texts-dostoevsky-crime-punishment.webm';
import demonImage from '../assets/media/author_texts-lermontov-demon.jpg';
import demonVideo from '../assets/media/author_texts-lermontov-demon.webm';
import type { AuthorText } from './author_texts_types';

const AUTHOR_TEXTS_MOCK_ITEMS: Omit<AuthorText, 'attributes'>[] = [
  {
    author_text_id: 1,
    work_title: 'Война и мир',
    short_description: 'Роман-эпопея о русском обществе в эпоху наполеоновских войн.',
    author_texts_image_url: warImage,
    author_texts_video_url: warVideo,
    text_length: 587287,
    unique_token_count: 18210,
    author_texts_ratio: 18210 / 587287,
    author_texts_like_count: 8,
    is_owner: 0,
    is_liked: 0,
  },
  {
    author_text_id: 2,
    work_title: 'Капитанская дочка',
    short_description: 'Исторический роман о событиях Пугачёвского восстания.',
    author_texts_image_url: captainImage,
    author_texts_video_url: captainVideo,
    text_length: 38420,
    unique_token_count: 8907,
    author_texts_ratio: 8907 / 38420,
    author_texts_like_count: 5,
    is_owner: 0,
    is_liked: 0,
  },
  {
    author_text_id: 3,
    work_title: 'Дама с собачкой',
    short_description: 'Рассказ о случайной встрече в Ялте и нравственном выборе героев.',
    author_texts_image_url: ladyImage,
    author_texts_video_url: ladyVideo,
    text_length: 8710,
    unique_token_count: 3451,
    author_texts_ratio: 3451 / 8710,
    author_texts_like_count: 3,
    is_owner: 0,
    is_liked: 0,
  },
  {
    author_text_id: 4,
    work_title: 'Преступление и наказание',
    short_description: 'Роман о преступлении, вине и нравственном возрождении.',
    author_texts_image_url: crimeImage,
    author_texts_video_url: crimeVideo,
    text_length: 211591,
    unique_token_count: 16984,
    author_texts_ratio: 16984 / 211591,
    author_texts_like_count: 12,
    is_owner: 0,
    is_liked: 0,
  },
  {
    author_text_id: 5,
    work_title: 'Отцы и дети',
    short_description: 'Роман о споре поколений, убеждениях и поиске своего пути.',
    // Empty media intentionally demonstrate the local default image and video.
    author_texts_image_url: '',
    author_texts_video_url: null,
    text_length: 86610,
    unique_token_count: 10482,
    author_texts_ratio: 10482 / 86610,
    author_texts_like_count: 4,
    is_owner: 0,
    is_liked: 0,
  },
  {
    author_text_id: 6,
    work_title: 'Демон',
    short_description: 'Поэма о мятежном духе, любви и одиночестве.',
    author_texts_image_url: demonImage,
    author_texts_video_url: demonVideo,
    text_length: 17900,
    unique_token_count: 5430,
    author_texts_ratio: 5430 / 17900,
    author_texts_like_count: 6,
    is_owner: 0,
    is_liked: 0,
  },
];

export const AUTHOR_TEXTS_MOCK: readonly AuthorText[] = AUTHOR_TEXTS_MOCK_ITEMS.map((text, index) => ({
  ...text,
  attributes: [
    { author_texts_attribute_id: 1, attribute_name: 'Язык', attribute_value: 'Русский' },
    { author_texts_attribute_id: 2, attribute_name: 'Жанр', attribute_value: index === 5 ? 'Поэма' : index === 2 ? 'Рассказ' : 'Роман' },
  ],
}));
