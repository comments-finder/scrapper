import { Parser } from './types';
import { Injectable } from '@nestjs/common';
import { DEFAULT_TIMEOUT, NAVIGATION_TIMEOUT } from '../config';

@Injectable()
export class DouParserService extends Parser {
  async getArticleComments(link) {
    const page = await this.browser.newPage();

    try {
      page.setDefaultTimeout(DEFAULT_TIMEOUT);
      page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

      await page.goto(link);

      await page.waitForSelector('#commentsList > .b-comment');

      const res = await page.evaluate((resultsSelector) => {
        return [...document.querySelectorAll(resultsSelector)].map((item) => {
          return item.textContent;
        });
      }, '#commentsList > .b-comment .comment_text > p');

      await page.close();

      return res;
    } catch (e) {
      await page.close();
      throw e;
    }
  }
  async getArticlesLinks() {
    const page = await this.browser.newPage();

    try {
      page.setDefaultTimeout(DEFAULT_TIMEOUT);
      page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

      await page.evaluateOnNewDocument(() =>
        Object.defineProperty(navigator, 'platform', {
          get: function () {
            return 'MacIntel';
          },
        }),
      );

      await page.goto('https://dou.ua/forums/');
      await page.waitForSelector('.b-forum-articles > article');

      const res = await page.evaluate((resultsSelector) => {
        return [...document.querySelectorAll(resultsSelector)].map((anchor) => {
          return {
            title: anchor.textContent,
            link: anchor.getAttribute('href'),
          };
        });
      }, '.b-forum-articles > article h2 > a:first-child');

      await page.close();

      return res;
    } catch (e) {
      await page.close();
      throw e;
    }
  }
}
