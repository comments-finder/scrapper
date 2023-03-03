export type Source = 'dou' | 'blind';
import { Comment } from './parsers/types';

export interface ArticleComments {
  source: Source;
  articleLink: string;
  articleTitle: string;
  comments: Comment[];
}

export interface ArticleCommentsResult {
  articles: ArticleComments[];
  errors: Error[];
}
