import { Inject } from '@nestjs/common';
import { BROWSER } from '../browser/browser.module';
import { Browser } from 'puppeteer';

export type ArticleLinks = {
  link: string;
  title: string;
};

export type Comment = {
  text: string;
  publicationDate: Date;
};

export abstract class Parser {
  constructor(@Inject(BROWSER) protected readonly browser: Browser) {}
  abstract getArticleComments(articleLink: string): Promise<Comment[]>;
  abstract getArticlesLinks(): Promise<ArticleLinks[]>;
}
