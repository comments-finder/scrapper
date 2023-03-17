import { Parser } from './types';
import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { DEFAULT_TIMEOUT, NAVIGATION_TIMEOUT } from '../config';

@Injectable()
export class DouParserService extends Parser {
  private readonly logger = new Logger(DouParserService.name);

  async getArticleComments(link) {
    const page = await this.browser.newPage();

    try {
      page.setDefaultTimeout(DEFAULT_TIMEOUT);
      page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

      await page.goto(link);

      await page.waitForSelector('#commentsList > .b-comment');

      const res = await page.evaluate((resultsSelector) => {
        return [...document.querySelectorAll(resultsSelector)].map((item) => {
          const text = item.querySelector('.comment_text')?.textContent;
          const publicationDate =
            item.querySelector('.comment-link')?.textContent;

          return {
            text,
            publicationDate,
          };
        });
      }, '#commentsList > .b-comment');

      const comments = res.map((comment) => ({
        ...comment,
        publicationDate: moment(comment.publicationDate, 'DD.MM.YYYY hh:mm')
          // Set Ukraine timezone
          .utcOffset(120, true)
          .utc()
          .toDate(),
      }));

      await page.close();

      return comments;
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

  async beforeApplicationShutdown() {
    try {
      await this.browser.close();
    } catch (e) {
      this.logger.error(e, e.stack);
    }
  }
}
