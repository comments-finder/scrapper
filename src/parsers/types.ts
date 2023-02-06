import { Inject } from '@nestjs/common';
import { BROWSER } from '../browser/browser.module';
import { Browser } from 'puppeteer';

export type ArticleLinks = {
  link: string;
  title: string;
};

export abstract class Parser {
  constructor(@Inject(BROWSER) protected readonly browser: Browser) {}
  abstract getArticleComments(articleLink: string): Promise<string[]>;
  abstract getArticlesLinks(): Promise<ArticleLinks[]>;
}
